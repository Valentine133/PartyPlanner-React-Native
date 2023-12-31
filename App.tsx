import "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";

import useCachedResources from "./hooks/useCachedResources";
import useColorScheme from "./hooks/useColorScheme";
import Navigation from "./navigation";

import { NhostClient, NhostProvider } from "@nhost/react";
import { NhostApolloProvider } from "@nhost/react-apollo";
import * as SecureStore from "expo-secure-store";

import { GestureHandlerRootView } from "react-native-gesture-handler";
// import { OverlayProvider } from "stream-chat-react-native";

const nhost = new NhostClient({
  subdomain: "wtnyxsildnoqkegpsihf",
  region: "eu-central-1",
  clientStorageType: "expo-secure-storage",
  clientStorage: SecureStore,
});

export default function App() {
  const isLoadingComplete = useCachedResources();
  const colorScheme = useColorScheme();

  if (!isLoadingComplete) {
    return null;
  } else {
    return (
      <GestureHandlerRootView style={{flex: 1}}>
        <SafeAreaProvider>
          <NhostProvider nhost={nhost}>
            <NhostApolloProvider nhost={nhost}>
              <Navigation colorScheme={colorScheme} />
            </NhostApolloProvider>
          </NhostProvider>
          <StatusBar />
        </SafeAreaProvider>
      </GestureHandlerRootView>
    );
  }
}
