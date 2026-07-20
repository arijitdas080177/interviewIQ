import { View, Text } from "react-native";
import type { RoleFitSection } from "@interviewiq/shared";
import { DetailBlock } from "../DetailBlock";

export function RoleFitContent({ section }: { section: RoleFitSection }) {
  return (
    <View>
      <Text className="text-sm font-semibold text-navy-500 dark:text-navy-300 mb-3 uppercase tracking-wide">
        Strong matches
      </Text>
      {section.strongMatches.map((detail, i) => (
        <DetailBlock key={i} detail={detail} />
      ))}

      <Text className="text-sm font-semibold text-navy-500 dark:text-navy-300 mb-3 mt-2 uppercase tracking-wide">
        Potential gaps to prepare for
      </Text>
      {section.potentialGaps.map((detail, i) => (
        <DetailBlock key={i} detail={detail} />
      ))}
    </View>
  );
}
