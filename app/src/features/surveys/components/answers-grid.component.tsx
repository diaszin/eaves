import { View, Text, FlatList } from "react-native";
import { SurveyAnswer, SurveyQuestionReponse } from "../services/survey.type";
import AnswerButton from "./answers-button.component";

interface AnswersGridProps {
  data: SurveyAnswer[];
  onClick: (answer: number) => void;
}

export default function AnswersGrid(props: AnswersGridProps) {
  return (
    <FlatList
      numColumns={1}
      data={props.data}
      keyExtractor={(item) => item.id.toString()}
      ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
      renderItem={({ item }) => {
        return (
          <AnswerButton
            onClick={() => {
              props.onClick(item.id);
            }}
            text={item.content}
          />
        );
      }}
    />
  );
}
