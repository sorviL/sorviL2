import SoftAurora from "../../components/softAurora/SoftAurora";
import "../../assets/css/chat/index.scss";

export function ChatPage() {
	return (
		<div className="chat-page">
			<SoftAurora
				speed={0.6}
				scale={1.5}
				brightness={1}
				color1="--color-primary"
				color2="--color-footer-developers-background"
				noiseFrequency={2.5}
				noiseAmplitude={1}
				bandHeight={0.5}
				bandSpread={1}
				octaveDecay={0.1}
				layerOffset={0}
				colorSpeed={1}
				enableMouseInteraction
				mouseInfluence={0.25}
			/>

			<div className="chat-page-content">
			</div>
		</div>
	);
}
