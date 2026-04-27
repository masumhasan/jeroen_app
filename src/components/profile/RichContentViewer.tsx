import React from "react";
import { ScrollView, useWindowDimensions } from "react-native";
import RenderHtml from "react-native-render-html";
import { TableRenderer, tableModel } from "@native-html/table-plugin";

type RichContentViewerProps = {
  html: string;
};

const RichContentViewer: React.FC<RichContentViewerProps> = ({ html }) => {
  const { width } = useWindowDimensions();
  const contentWidth = Math.max(width - 72, 240);

  const source = {
    html: `<div>${html || ""}</div>`,
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <RenderHtml
        contentWidth={contentWidth}
        source={source}
        renderers={{
          table: TableRenderer,
        }}
        customHTMLElementModels={{
          table: tableModel,
        }}
        tagsStyles={{
          body: { color: "#333333", fontSize: 14, lineHeight: 24 },
          p: { marginTop: 0, marginBottom: 14 },
          h1: { fontSize: 28, marginBottom: 12, marginTop: 8, color: "#1f1f1f" },
          h2: { fontSize: 24, marginBottom: 10, marginTop: 6, color: "#1f1f1f" },
          h3: { fontSize: 20, marginBottom: 8, marginTop: 6, color: "#1f1f1f" },
          h4: { fontSize: 18, marginBottom: 8, marginTop: 4, color: "#1f1f1f" },
          ul: { marginTop: 0, marginBottom: 14 },
          ol: { marginTop: 0, marginBottom: 14 },
          li: { marginBottom: 8 },
          img: { marginBottom: 14, borderRadius: 10 },
          table: { marginBottom: 16 },
          th: {
            padding: 8,
            backgroundColor: "#efefef",
            borderColor: "#cfcfcf",
            borderWidth: 1,
          },
          td: { padding: 8, borderColor: "#cfcfcf", borderWidth: 1 },
        }}
      />
    </ScrollView>
  );
};

export default RichContentViewer;
