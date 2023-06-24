import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  Pressable,
  Alert,
  ActivityIndicator,
} from "react-native";
import { View } from "../components/Themed";
import { RootTabScreenProps } from "../types";
import { Agenda, AgendaEntry, AgendaSchedule } from "react-native-calendars";
import { gql, useQuery } from "@apollo/client";

const GetEvents = gql`
  query GetEvents {
    Event {
      id
      name
      date
    }
  }
`;

// Grouped Events for days
const getEventsSchedule = (events: []): AgendaSchedule => {
  const items: AgendaSchedule = {};

  events.forEach((event) => {
    const day = event.date.slice(0, 10); 

    if (!items[day]) {
      items[day] = [];
    }
    items[day].push({ ...event, day, height: 50 });
  });

  return items;
};

export default function TabOneScreen({
  navigation,
}: RootTabScreenProps<"TabOne">) {
  const { data, loading, error } = useQuery(GetEvents);
  const [selectedDay, setSelectedDay] = useState<string>(null);
  // const navigation = useNavigation();

  const handleOpenModal = () => {
    navigation.navigate("ModalAddEvent");
  };

  const renderItem = (reservation: AgendaEntry, isFirst: boolean) => {
    const fontSize = isFirst ? 16 : 14;
    const color = isFirst ? "black" : "#43515c";
    const isClosestDay = reservation.day === selectedDay;

    return (
      <Pressable
        style={[
          styles.item,
          {
            height: reservation.height,
            // backgroundColor: isClosestDay ? "yellow" : "white",
          },
        ]}
        onPress={() => navigation.navigate("Modal", { id: reservation.id })}
      >
        <Text style={{ fontSize, color }}>{reservation.name}</Text>
      </Pressable>
    );
  };

  const renderEmptyDate = () => {
    return (
      <View style={styles.emptyDate}>
        <Text style={styles.notFound}>This is empty date!</Text>
      </View>
    );
  };

  if (loading) {
    return <ActivityIndicator />;
  }

  if (error) {
    Alert.alert("Error fetching events", error.message);
  }

  const events = getEventsSchedule(data?.Event);

  if (!events || Object.keys(events).length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.notFound}>No events found.</Text>
      </View>
    );
  }

  const closestDay = Object.keys(events).find((day) => {
    const eventDate = new Date(day);
    const currentDate = new Date();

    return eventDate >= currentDate;
  });

  if (!closestDay) {
    return (
      <View style={styles.container}>
        <Text>No upcoming events found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Agenda
        items={events}
        selected={closestDay}
        renderItem={renderItem}
        renderEmptyDate={renderEmptyDate}
        onDayPress={(day) => setSelectedDay(day.dateString)}
        disableAllTouchEventsForInactiveDays={true}
      />
      <Pressable style={styles.addButton} onPress={handleOpenModal}>
        <Text style={styles.addButtonLabel}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  item: {
    backgroundColor: "white",
    flex: 1,
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
    marginTop: 17,
  },
  emptyDate: {
    height: 15,
    flex: 1,
    paddingTop: 30,
  },
  notFound: {
    padding: 10,
    fontSize: 20,
  },
  addButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "blue",
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
  addButtonLabel: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
});
