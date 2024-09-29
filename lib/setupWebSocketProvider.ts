import { WebSocketProvider, ethers } from 'ethers';

const setupWebSocketProvider = (): WebSocketProvider | null => {
  const websocketUrl = process.env.NEXT_PUBLIC_WEBSOCKET_RPC_URL;

  if (!websocketUrl) {
    console.error('WebSocket URL is not defined in environment variables');
    return null;
  }

  try {
    const provider = new WebSocketProvider(websocketUrl);

    // WebSocket 연결 상태 모니터링
    const websocket = provider.websocket;

    // provider.on('debug', (info) => {
    //   console.log('WebSocket Debug:', info);
    // });

    provider.on('network', (newNetwork, oldNetwork) => {
      if (oldNetwork) {
        console.log('Network changed:', newNetwork.name);
      } else {
        console.log('Connected to network:', newNetwork.name);
      }
    });

    websocket.onopen = () => {
      console.log('WebSocket connection established');
    };

    websocket.close = () => {
      console.log('WebSocket connection closed');
      // 여기에 재연결 로직을 추가할 수 있습니다
    };

    websocket.onerror = (error: Event) => {
      console.error('WebSocket error:', error);
    };

    // Provider 이벤트 리스닝
    provider.on('network', (newNetwork, oldNetwork) => {
      if (oldNetwork) {
        console.log('Network changed:', newNetwork.name);
      }
    });

    // 연결 상태 확인을 위한 주기적인 요청
    const intervalId = setInterval(async () => {
      try {
        await provider.getBlockNumber();
      } catch (error) {
        console.error('Error fetching block number:', error);
        // 여기에 재연결 로직을 추가할 수 있습니다
      }
    }, 10000); // 30초마다 확인

    // 클린업 함수 반환
    return Object.assign(provider, {
      destroy: () => {
        clearInterval(intervalId);
        provider.removeAllListeners();
        websocket.close();
      },
    });
  } catch (error) {
    console.error('Error setting up WebSocket provider:', error);
    return null;
  }
};

export default setupWebSocketProvider;
