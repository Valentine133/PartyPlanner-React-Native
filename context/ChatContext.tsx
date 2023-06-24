import { useUserData } from '@nhost/react';
import { useNavigation } from '@react-navigation/native';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { ActivityIndicator } from 'react-native';
import { StreamChat, Channel } from 'stream-chat';
import { OverlayProvider, Chat } from "stream-chat-expo";

type ChatContentType = {
  currentChannel?: Channel;
};

export const ChatContext = createContext<ChatContentType>({ currentChannel : undefined});

const ChatContextProvider = ({children}: {children: React.ReactNode}) => {
  // component
  const [chatClient, setChatClient] = useState<StreamChat>();
  const [currentChannel, setCurrentChannel] = useState<Channel>();

  const user = useUserData();
  const navigation = useNavigation();

  useEffect(() => {
    const initChat = async () => {
      if (!user) {
        return;
      }

      const client = StreamChat.getInstance("xgmn5t9k6f7q");

      //get information about the outhenticated

      // connect the user to stream chat
      await client.connectUser({
        id: user.id,
        name: user.displayName,
        image: user.avatarUrl,
      }, 
        client.devToken(user.id)
      );

      setChatClient(client);

      const globalChannel = client.channel("livestream", "global", {
        name: "Birthday",
      });

      await globalChannel.watch();
    };
    initChat();
  }, []);

  useEffect(() => {
    return () => {
      if (chatClient) {
        chatClient.disconnectUser();
      }
    };
  }, []);

  const startDMChatRoom = async (chatWithUser) => {
    if (!chatClient?.userID) {
      return;
    }

    try {
      // console.warn("User Id", user.id);
      const newChannel = chatClient.channel("messaging", {
        members: [chatClient.userID, chatWithUser.id],
      });

      await newChannel.watch();
      setCurrentChannel(newChannel);

      // navigation.goBack();
      navigation.replace("ChatRoom");
    } catch (err) {
      console.log(err);
    }
  }

  const joinEventChatRoom = async (event) => {
    if (!chatClient) {
      return;
    }
    const channelId = `room-${event.id}`;
    const eventChannel = chatClient.channel("livestream", channelId, {
      name: event.name,
    });

    await eventChannel.watch({ watchers: { limit: 100 } });
    setCurrentChannel(eventChannel);

    navigation.navigate("Root", {
      screen: "Chat",
    });
    navigation.navigate("Root", {
      screen: "Chat",
      params: { screen: "ChatRoom" },
    });
  };

  if (!chatClient) {
    return <ActivityIndicator/>;
  }

  const value = {
    chatClient,
    currentChannel,
    setCurrentChannel,
    startDMChatRoom,
    joinEventChatRoom,
  };
  return (
    <OverlayProvider>
      <Chat client={chatClient}>
        <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
      </Chat>
    </OverlayProvider>
  );
};

export const useChatContext = () => useContext(ChatContext);

export default ChatContextProvider;