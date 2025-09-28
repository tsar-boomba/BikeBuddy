import { useState, useEffect, ReactNode } from 'react';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Portal } from '@rn-primitives/portal';
import * as ToastPrimitive from '@rn-primitives/toast';

type Props = {
	onClose: () => void;
	children: ReactNode;
};

export const Toast = ({ onClose, children }: Props) => {
	const [open, setOpen] = useState(true);
	const insets = useSafeAreaInsets();

	useEffect(() => {
		let timeout: ReturnType<typeof setTimeout> | null = null;

		if (open) {
			timeout = setTimeout(() => {
				setOpen(false);
				onClose();
			}, 3000);
		} else {
			if (timeout) {
				clearInterval(timeout);
			}
		}

		if (timeout && !open) {
			clearInterval(timeout);
		}

		return () => {
			if (timeout) {
				clearInterval(timeout);
			}
		};
	}, [open]);

	return (
		<>
			{open && (
				<Portal name='toast-example'>
					<View
						style={{ top: insets.top + 4 }}
						className='px-4 absolute w-full'
					>
						<ToastPrimitive.Root
							type='foreground'
							open={open}
							onOpenChange={(open) => {
								if (!open) onClose();
								setOpen(open);
							}}
							className='opacity-95 bg-secondary border-border flex-row justify-between items-center p-4 rounded-xl'
						>
							{children}
						</ToastPrimitive.Root>
					</View>
				</Portal>
			)}
		</>
	);
};
