import { useEffect, useState, useRef } from 'react';
import * as Location from 'expo-location';
import { Accelerometer } from 'expo-sensors';

/**
 * Uses GPS to track the speed of the user
 * @returns speed in mph
 */
export const useMotion = (): {
	smoothSpeed: number | null;
	slowingDown: boolean;
} => {
	const [smoothSpeed, setSmoothSpeed] = useState<number | null>(null); // smoothed speed (m/s)
	const buffer = useRef<number[]>([]); // store last few readings
	const windowSize = 5; // moving average window (5 samples)

	const [slowingDown, setSlowingDown] = useState(false);
	const lastSpeed = useRef(0);
	const currSpeed = useRef(0);

	const updateSlowing = () => {
		// condition 1: GPS speed is decreasing
		// keep track of last speed
		const decel = currSpeed.current < lastSpeed.current - 0.3;
		lastSpeed.current = currSpeed.current;

		setSlowingDown(decel);
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
					timeInterval: 500, // ms
					distanceInterval: 1, // meters
				},
				({ coords }) => {
					const gpsSpeed = coords.speed; // raw m/s
					if (gpsSpeed === null || gpsSpeed === -1) {
						// If speed isn't available for whatever reason, reset everything
						setSmoothSpeed(null);
						buffer.current = [];
						lastSpeed.current = 0;
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
					updateSlowing();
				},
			);
		})();

		return () => {
			locSub?.remove();
		};
	}, []);

	return {
		smoothSpeed: smoothSpeed === null ? null : smoothSpeed * 2.237,
		slowingDown,
	};
};
