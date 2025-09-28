import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';

export const BRAIN_IP = '192.168.4.1';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export const useSaveImage = () => {
	const [permissionResponse, requestPermission] = MediaLibrary.usePermissions({
		writeOnly: true,
		granularPermissions: ['photo'],
		get: true,
		request: true,
	});

	return async (url: string): Promise<string> => {
		try {
			if (permissionResponse?.status !== 'granted') {
				await requestPermission();
			}
			// Download the file
			console.log('download');
			const { uri } = await FileSystem.File.downloadFileAsync(
				url,
				FileSystem.Paths.cache,
				{
					idempotent: true,
				},
			);

			// Save to camera roll
			console.log('create asset');
			const asset = await MediaLibrary.createAssetAsync(uri);

			console.log('Saved to camera roll:', asset.uri);
		} catch (err) {
			console.log('Error saving image:', err);
			return err?.toString() ?? '';
		}

		return '';
	};
};
