import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useEffect, useRef, useState } from 'react';
import * as Location from 'expo-location';
import { Text } from '@/components/ui/text';
import { WebView } from 'react-native-webview';
import { Button } from '@/components/ui/button';
import { View } from 'react-native';
import { useMotion } from '@/hooks/use-motion';
import { useOrientation } from '@/hooks/use-orientation';
import { Maps } from '@/components/Maps';
import { BRAIN_IP, useSaveImage } from '@/lib/utils';
import { Toast } from '@/components/Toast';

export default function Riding() {
	const { smoothSpeed, slowingDown } = useMotion();
	const [showWebView, setShowWebView] = useState(false);
	const orientation = useOrientation();
	const isPortait = orientation === 'portrait';
	const [savingImage, setSavingImage] = useState(false);
	const [err, setErr] = useState('');
	const [openToast, setOpenToast] = useState(false);
	const saveImage = useSaveImage();

	useEffect(() => {
		try {
			if (slowingDown) {
				fetch(`http://${BRAIN_IP}:80/brake?status=1`).catch(() => {});
			} else {
				fetch(`http://${BRAIN_IP}:80/brake?status=0`).catch(() => {});
			}
		} catch (_) {}
	}, [slowingDown]);

	return (
		<View className={`flex-1 ${isPortait ? 'flex-col' : 'gap-4 flex-row'}`}>
			<Maps style={{ flex: 1 }} />
			<View className={`flex flex-col gap-4 py-8`}>
				<Text
					className={`text-center ${isPortait ? 'text-7xl font-black' : 'text-8xl font-bold'}`}
				>
					{smoothSpeed === null ? '-' : `${smoothSpeed.toFixed(2)}`} mph
				</Text>
				{slowingDown && (
					<Text variant='h1' className='text-red-600'>
						Braking!!!!
					</Text>
				)}
				{openToast && (
					<Toast onClose={() => setOpenToast(false)}>
						{err ? <Text>{err}</Text> : <Text>Image Saved!</Text>}
					</Toast>
				)}
				<View style={{ height: 200 }}>
					{showWebView && (
						<WebView
							automaticallyAdjustContentInsets
							scalesPageToFit
							startInLoadingState={false}
							contentInset={{ top: 0, right: 0, left: 0, bottom: 0 }}
							scrollEnabled={false}
							source={{ uri: `http://${BRAIN_IP}:81/stream` }}
							onError={(syntheticEvent) =>
								console.warn('WebView Error:', syntheticEvent.nativeEvent)
							}
						/>
					)}
				</View>
				<Button className='mx-4' onPress={() => setShowWebView(!showWebView)}>
					<Text>{showWebView ? 'Hide Video' : 'Show Video'}</Text>
				</Button>
				<Button
					className='mx-4'
					disabled={savingImage}
					onPress={async () => {
						try {
							setSavingImage(true);
							const TEST_URL = `https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Felis_silvestris_silvestris_small_gradual_decrease_of_quality_-_JPEG_compression.jpg/250px-Felis_silvestris_silvestris_small_gradual_decrease_of_quality_-_JPEG_compression.jpg`;
							// const err = await saveImage(TEST_URL);
							const err = await saveImage(`http://${BRAIN_IP}:80/capture`);
							setErr(err);
							setOpenToast(true);
						} finally {
							setSavingImage(false);
						}
					}}
				>
					<Text>Take Picture</Text>
				</Button>
			</View>
		</View>
	);
}
