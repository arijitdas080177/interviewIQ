import { View } from "react-native";
import type { ResearchSection } from "@interviewiq/shared";
import { DetailBlock } from "../DetailBlock";

export function ResearchSectionContent({ section }: { section: ResearchSection }) {
  return (
    <View>
      {section.details.map((detail, i) => (
        <DetailBlock key={i} detail={detail} />
      ))}
    </View>
  );
}
