import { useEffect, useState, useRef } from 'react';
import * as Location from 'expo-location';
import { DeviceMotion, Magnetometer } from 'expo-sensors';

function eulerToRotationMatrix(alpha: number, beta: number, gamma: number) {
	const cA = Math.cos(alpha),
		sA = Math.sin(alpha);
	const cB = Math.cos(beta),
		sB = Math.sin(beta);
	const cG = Math.cos(gamma),
		sG = Math.sin(gamma);

	return [
		[cA * cG - sA * sB * sG, -cB * sA, cA * sG + cG * sA * sB],
		[cG * sA + cA * sB * sG, cA * cB, sA * sG - cA * cG * sB],
		[-cB * sG, sB, cB * cG],
	];
}

function applyRotationMatrix(
	v: { x: number; y: number; z: number },
	R: number[][],
) {
	return {
		x: R[0][0] * v.x + R[0][1] * v.y + R[0][2] * v.z,
		y: R[1][0] * v.x + R[1][1] * v.y + R[1][2] * v.z,
		z: R[2][0] * v.x + R[2][1] * v.y + R[2][2] * v.z,
	};
}

function normalize(v: { x: number; y: number; z: number }) {
	const mag = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
	return { x: v.x / mag, y: v.y / mag, z: v.z / mag };
}

function cross(
	a: { x: number; y: number; z: number },
	b: { x: number; y: number; z: number },
) {
	return {
		x: a.y * b.z - a.z * b.y,
		y: a.z * b.x - a.x * b.z,
		z: a.x * b.y - a.y * b.x,
	};
}

function tiltCompensatedHeading(
	m: { x: number; y: number; z: number },
	g: { x: number; y: number; z: number },
) {
	const gNorm = normalize(g);

	// East = m × g
	const east = normalize(cross(m, gNorm));

	// North = g × East
	const north = cross(gNorm, east);

	// Heading = atan2(East.x, North.x) in world XY plane
	let heading = Math.atan2(east.y, north.y);
	heading = (heading * 180) / Math.PI;
	if (heading < 0) heading += 360;

	return heading;
}

/**
 * Uses GPS to track the speed of the user
 * @returns speed in mph
 */
export const useMotion = (): {
	smoothSpeed: number | null;
	slowingDown: boolean;
} => {
	const [smoothSpeed, setSmoothSpeed] = useState<number | null>(null); // smoothed speed (m/s)
	const bearingDegrees = useRef(0);
	const buffer = useRef<number[]>([]); // store last few readings
	const windowSize = 3; // moving average window (5 samples)

	const [slowingDown, setSlowingDown] = useState(false);
	const debounceCounter = useRef(0);
	const currSpeed = useRef(0);
	const accel = useRef({ x: 0, y: 0, z: 0 });
	const rot = useRef({ alpha: 0, beta: 0, gamma: 0 });
	const accelDebounce = 6; // Require N negative threshold crosses to count as braking

	const mag = useRef({ x: 0, y: 0, z: 0 });
	const gravity = useRef({ x: 0, y: 0, z: -1 });

	const updateSlowing = () => {
		// Rotate into world frame
		const R = eulerToRotationMatrix(
			rot.current.alpha,
			rot.current.beta,
			rot.current.gamma,
		);
		const accelWorld = applyRotationMatrix(accel.current, R);
		const rad = (bearingDegrees.current * Math.PI) / 180;
		const vHat = { x: Math.sin(rad), y: Math.cos(rad), z: 0 };

		const aParallel =
			accelWorld.x * vHat.x + accelWorld.y * vHat.y + accelWorld.z * vHat.z;

		// Negative projection => deceleration
		if (currSpeed.current >= 1 && aParallel < -1.0) {
			debounceCounter.current++;
			setSlowingDown(debounceCounter.current > accelDebounce);
		} else if (aParallel > 0.1) {
			// only reset if acceleration turns clearly positive
			debounceCounter.current = 0;
			setSlowingDown(false);
		}

		bearingDegrees.current = tiltCompensatedHeading(
			mag.current,
			gravity.current,
		);
	};

	useEffect(() => {
		let locSub: Location.LocationSubscription | null = null;
		(async () => {
			let { status } = await Location.requestForegroundPermissionsAsync();
			if (status !== 'granted') {
				console.error('Permission to access location was denied');
				return;
			}

			locSub = await Location.watchPositionAsync(
				{
					accuracy: Location.Accuracy.Highest,
					timeInterval: 100, // ms
					distanceInterval: 0, // meters
				},
				({ coords }) => {
					const gpsSpeed = coords.speed; // raw m/s
					if (gpsSpeed === null || gpsSpeed === -1) {
						// If speed isn't available for whatever reason, reset everything
						setSmoothSpeed(null);
						buffer.current = [];
						currSpeed.current = 0;
						setSlowingDown(false);
						return;
					}

					// Add to buffer
					buffer.current.push(gpsSpeed);
					if (buffer.current.length > windowSize) {
						buffer.current.shift(); // keep buffer size fixed
					}

					// Compute moving average
					const avg =
						buffer.current.reduce((a, b) => a + b, 0) / buffer.current.length;

					setSmoothSpeed(avg);
					currSpeed.current = gpsSpeed;
				},
			);
		})();

		DeviceMotion.setUpdateInterval(50);
		const devMotionSub = DeviceMotion.addListener(
			({ acceleration, rotation, accelerationIncludingGravity }) => {
				if (!acceleration || !rotation || !accelerationIncludingGravity) return;
				const { x, y, z } = accelerationIncludingGravity;

				// Low-pass filter to estimate gravity
				gravity.current.x = 0.9 * gravity.current.x + 0.1 * x;
				gravity.current.y = 0.9 * gravity.current.y + 0.1 * y;
				gravity.current.z = 0.9 * gravity.current.z + 0.1 * z;

				accel.current = acceleration;
				rot.current = rotation;
				updateSlowing();
			},
		);

		Magnetometer.setUpdateInterval(50);
		const magSub = Magnetometer.addListener((data) => {
			mag.current = data;
		});

		return () => {
			locSub?.remove();
			devMotionSub?.remove();
			magSub?.remove();
		};
	}, []);

	const mph = smoothSpeed === null ? null : smoothSpeed * 2.237;

	return {
		smoothSpeed: mph === null ? null : mph < 1 ? 0 : mph,
		slowingDown,
	};
};
