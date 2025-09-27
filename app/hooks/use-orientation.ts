import * as ScreenOrientation from 'expo-screen-orientation';
import { useEffect, useState } from 'react';

export const useOrientation = (): 'portrait' | 'landscape' => {
	const [orientation, setOrientation] = useState<'portrait' | 'landscape'>(
		'portrait',
	);

	useEffect(() => {
		let listener: ScreenOrientation.Subscription | null = null;
		(async () => {
			await ScreenOrientation.unlockAsync();
			listener = ScreenOrientation.addOrientationChangeListener(
				({ orientationInfo }) => {
					if (
						orientationInfo.orientation ===
							ScreenOrientation.Orientation.LANDSCAPE_LEFT ||
						orientationInfo.orientation ===
							ScreenOrientation.Orientation.LANDSCAPE_RIGHT
					) {
						setOrientation('landscape');
					} else if (
						orientationInfo.orientation ===
							ScreenOrientation.Orientation.PORTRAIT_UP ||
						orientationInfo.orientation ===
							ScreenOrientation.Orientation.PORTRAIT_DOWN
					) {
						setOrientation('portrait');
					}
				},
			);
		})();

		return () => {
			listener?.remove();
		};
	}, []);

	return orientation;
};
