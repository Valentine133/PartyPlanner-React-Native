import React, { useState } from "react";
import { StyleSheet, Text, View, ActivityIndicator, Alert } from "react-native";
import { useMutation, gql } from "@apollo/client";
import { useForm } from "react-hook-form";
import { useUserId } from "@nhost/react";
import CustomButton from "../components/CustomButton";
import CustomInput from "./AuthScreens/components/CustomInput";

const CREATE_EVENT = gql`
  mutation CreateEvent($name: String!, $date: timestamptz!) {
    insert_Event_one(object: { name: $name, date: $date }) {
      id
      EventAttendee {
        eventId
        id
        userId
      }
    }
  }
`;

const JOIN_EVENT = gql`
  mutation InsertEventAttendee($eventId: uuid!, $userId: uuid!) {
    insert_EventAttendee(objects: [{ eventId: $eventId, userId: $userId }]) {
      returning {
        id
        userId
        eventId
        Event {
          id
          EventAttendee {
            id
          }
        }
      }
    }
  }
`;

const ModalAddEventScreen = ({ navigation }) => {
  const { control, handleSubmit } = useForm();
  const userId = useUserId();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [createEvent] = useMutation(CREATE_EVENT, {
    onCompleted: async ({ insert_Event_one }) => {
      const eventId = insert_Event_one.id;

      try {
        await joinEvent({ variables: { eventId, userId } });

        await navigation.navigate("Modal", { id: eventId });
      } catch (error) {
        Alert.alert("Error joining event", error.message);
      }
    },
    onError: (error) => {
      Alert.alert("Error creating event", error.message);
    },
  });

  const [joinEvent] = useMutation(JOIN_EVENT);

  const handleCreateEvent = async (data) => {
    if (!data.name || !data.date) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { name, date } = data;

      await createEvent({ variables: { name, date } });

      setLoading(false);
    } catch (error) {
      setLoading(false);
      setError(`Error creating event: ${error.message}`);
      console.log("Error creating event:", error); // Log the actual error for debugging
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Event title:</Text>
      <CustomInput
        name="name"
        control={control}
        placeholder="Name"
        rules={{
          required: "Name is required",
          minLength: {
            value: 3,
            message: "Name should be at least 3 characters long",
          },
          maxLength: {
            value: 100,
            message: "Name should be max 100 characters long",
          },
        }}
      />

      <Text style={styles.title}>Event date:</Text>
      <CustomInput
        name="date"
        control={control}
        placeholder="Date"
        rules={{
          required: "Date is required",
        }}
      />

      <CustomButton
        text="Add event"
        onPress={handleSubmit(handleCreateEvent)}
        type="PRIMARY"
      />

      {loading && <ActivityIndicator />}
      {error && <Text>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#051C60",
    margin: 10,
  },
});

export default ModalAddEventScreen;
