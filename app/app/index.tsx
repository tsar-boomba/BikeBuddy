import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useEffect, useState } from 'react';
import * as Location from 'expo-location';
import { Text } from '@/components/ui/text';
import { WebView } from 'react-native-webview';
import { Button } from '@/components/ui/button';
import { View } from 'react-native';

export default function Home() {
	const [speed, setSpeed] = useState(0);
	const [showWebView, setShowWebView] = useState(false);

	useEffect(() => {
		let locSub: Location.LocationSubscription | null = null;
		(async () => {
			let { status } = await Location.requestForegroundPermissionsAsync();
			if (status !== 'granted') {
				console.error('Permission to access location was denied');
				return;
			}

			// Subscribe to location updates
			locSub = await Location.watchPositionAsync(
				{
					accuracy: Location.Accuracy.Highest,
					timeInterval: 500,
					distanceInterval: 1,
				},
				(loc) => {
					if (loc.coords.speed === null || loc.coords.speed === -1) {
						return;
					}

					setSpeed(loc.coords.speed);
				},
			);
		})();

		return () => {
			locSub?.remove();
		};
	}, []);

	return (
		<SafeAreaView className='flex-1 p-4'>
			<View style={{ height: 200 }}>
			{showWebView && (
				<WebView
					automaticallyAdjustContentInsets
					scalesPageToFit
					startInLoadingState={false}
					contentInset={{ top: 0, right: 0, left: 0, bottom: 0 }}
					scrollEnabled={false}
					source={{ uri: 'http://192.168.4.1:81/stream' }}
					
					onError={(syntheticEvent) =>
						console.warn('WebView Error:', syntheticEvent.nativeEvent)
					}
				/>
			)}</View>
			<Text>speed: {speed}</Text>
			<Button onPress={() => setShowWebView(!showWebView)}>
				<Text>{showWebView ? 'hide webview' : 'show webview'}</Text>
			</Button>
		</SafeAreaView>
	);
}
