import { AppleMaps, GoogleMaps } from 'expo-maps';
import { Platform, StyleProp, ViewStyle } from 'react-native';
import { Text } from './ui/text';
import {
	AppleMapsMapStyleElevation,
	AppleMapsMapStyleEmphasis,
} from 'expo-maps/build/apple/AppleMaps.types';
import { useEffect, useState, useRef } from 'react';
import * as Location from 'expo-location';

type Props = {
	style?: StyleProp<ViewStyle>;
};

export const Maps = ({ style }: Props) => {
	const [coords, setCoords] = useState<Location.LocationObjectCoords | null>(
		null,
	);
	const currCoords = useRef<Location.LocationObjectCoords | null>(null);
	const [userMoved, setUserMoved] = useState(false);

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
					accuracy: Location.Accuracy.BestForNavigation,
					timeInterval: 250, // ms
					distanceInterval: 1, // meters
				},
				({ coords }) => {
					setCoords(coords);
					currCoords.current = coords;
				},
			);
		})();

		return () => {
			locSub?.remove();
		};
	}, []);

	if (Platform.OS === 'ios') {
		return (
			<AppleMaps.View
				style={style}
				onCameraMove={({ coordinates: { latitude, longitude } }) => {
					if (
						latitude !== currCoords.current?.latitude ||
						longitude !== currCoords.current?.longitude
					) {
						console.log('User moved map!');
						setUserMoved(true);
						setTimeout(() => setUserMoved(false), 5000);
					}
				}}
				cameraPosition={
					userMoved
						? undefined
						: {
								coordinates: {
									latitude: coords?.latitude,
									longitude: coords?.longitude,
								},
								zoom: 17,
							}
				}
				properties={{
					isMyLocationEnabled: true,
					selectionEnabled: false,
					elevation: AppleMapsMapStyleElevation.FLAT,
					isTrafficEnabled: false,
					emphasis: AppleMapsMapStyleEmphasis.MUTED,
				}}
				uiSettings={{
					myLocationButtonEnabled: true,
					togglePitchEnabled: false,
					compassEnabled: true,
					scaleBarEnabled: false,
				}}
			/>
		);
	} else if (Platform.OS === 'android') {
		return <GoogleMaps.View style={style} />;
	} else {
		return <Text>Maps are only available on Android and iOS</Text>;
	}
};
