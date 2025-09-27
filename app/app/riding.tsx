import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import * as Location from 'expo-location';
import { Text } from '@/components/ui/text';
import { WebView } from 'react-native-webview';
import { Button } from '@/components/ui/button';
import { View } from 'react-native';
import { useMotion } from '@/hooks/use-motion';
import { useOrientation } from '@/hooks/use-orientation';
import { Maps } from '@/components/Maps';

export default function Riding() {
	const { smoothSpeed, slowingDown } = useMotion();
	const [showWebView, setShowWebView] = useState(false);
	const orientation = useOrientation();

	return (
		<View
			className={`flex-1 ${orientation === 'portrait' ? 'flex-col' : 'flex-row'}`}
		>
			<Maps style={{ flex: 1 }} />
			<View className='flex flex-col gap-4 py-8'>
				<Text className='text-center text-7xl font-black'>
					{smoothSpeed === null ? '-' : `${smoothSpeed.toFixed(2)}`} mph
				</Text>
				{slowingDown && (
					<Text variant='h1' className='text-red-600'>
						Braking!!!!
					</Text>
				)}
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
					)}
				</View>
				<Button onPress={() => setShowWebView(!showWebView)}>
					<Text>{showWebView ? 'hide webview' : 'show webview'}</Text>
				</Button>
				<Button>
					<Text>Take Picture</Text>
				</Button>
			</View>
		</View>
	);
}
