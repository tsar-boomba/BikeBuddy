import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { useRouter } from 'expo-router';

export default function Home() {
	const router = useRouter();

	return (
		<SafeAreaView className='flex-1 p-4'>
			<Text variant='h1'>Smart Bike Riding</Text>
			<Button size='default' onPress={() => router.navigate('/riding')}>
				<Text variant='h1'>Start Ride</Text>
			</Button>
		</SafeAreaView>
	);
}
