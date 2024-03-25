import type { ActionFunctionArgs, LoaderFunction } from "@remix-run/node";
import {
  BlockStack,
  Box,
  Button,
  Card,
  ChoiceList,
  InlineGrid,
  Page,
  Select,
  Text,
  TextField,
  ActionList,
  ButtonGroup,
  List,
  Popover,
  InlineCode,
} from "@shopify/polaris";
import { useState } from "react";
import { GetAllSurveys, UpdatetheRenderSurvey } from "~/models/survey.server";
import { authenticate } from "~/shopify.server";
import type { TypeSurvey, SurveyParams } from "./app.survey";
import { useLoaderData, useSubmit } from "@remix-run/react";
import type { SubmitFunction } from "@remix-run/react";

type Cardparms = {
  index: number;
  Survey: TypeSurvey;
  setSurveyIndex: (index: number) => void;
  HandelSetSurveyInShop: (id: number) => void;
  submit: SubmitFunction;
  MainSurveyId: number;
  setMainSurveyId: (id: number) => void;
};

export const loader: LoaderFunction = async ({ request }) => {
  await authenticate.admin(request);
  const Surveys = await GetAllSurveys();
  return Surveys;
};
export async function action({ request }: ActionFunctionArgs) {
  await authenticate.admin(request);
  const data = {
    ...Object.fromEntries(await request.formData()),
  };
  const SurveyId = +data.SurveyId;

  const UodateTheSurve = await UpdatetheRenderSurvey(SurveyId);

  console.log("=====UodateTheSurve=====");
  console.log(UodateTheSurve);

  return null;
}

export default function ResourceSurveyMangement() {
  const submit = useSubmit();
  const SurveysLoader: [] = useLoaderData();
  const SurveysData: TypeSurvey[] = SurveysLoader;

  const [surveys] = useState<TypeSurvey[]>(SurveysData);
  const [SurveyIndex, setSurveyIndex] = useState<number>(0);
  const TheMainSurevyId = surveys.filter(
    (survey) => survey.RenderInShop == true,
  );
  const [MainSurveyId, setMainSurveyId] = useState<number>(
    TheMainSurevyId[0].id,
  );

  const HandelSetSurveyInShop = (id: number) => {
    const data = {
      SurveyId: id,
    };
    submit(data, { method: "post" });
    setMainSurveyId(id);
  };

  if (surveys == null) {
    return (
      <Page
        backAction={{ content: "Products", url: "" }}
        title="Surveys Mangement"
        pagination={{
          hasPrevious: true,
          hasNext: true,
        }}
      >
        <InlineGrid columns={{ xs: 2, md: "2fr 2fr" }} gap="400">
          <InlineGrid gap="400">
            <BlockStack gap="400">
              <Button>Create New survey</Button>
            </BlockStack>
          </InlineGrid>
        </InlineGrid>
      </Page>
    );
  }
  return (
    <Page
      backAction={{ content: "Products", url: "" }}
      title="Surveys Mangement"
      pagination={{
        hasPrevious: false,
        hasNext: false,
      }}
    >
      <InlineGrid columns={{ xs: 2, md: "2fr 2fr" }} gap="400">
        <BlockStack gap="400">
          <BlockStack gap="400">
            <Text variant="headingMd" as="h1">
              {"Surveys"}
            </Text>
            {surveys.map((surevy, i) => {
              return (
                <div key={i}>
                  <CardWithSeparateHeader
                    setMainSurveyId={setMainSurveyId}
                    MainSurveyId={MainSurveyId}
                    HandelSetSurveyInShop={HandelSetSurveyInShop}
                    submit={submit}
                    index={i}
                    setSurveyIndex={setSurveyIndex}
                    Survey={surevy}
                  />
                </div>
              );
            })}
          </BlockStack>
        </BlockStack>

        <BlockStack gap="400">
          <div style={{ border: "", borderRadius: "13px" }}>
            <Card roundedAbove="sm">
              <BlockStack gap="400">
                <Box borderRadius="300" minHeight="1rem" />
              </BlockStack>
              <BlockStack gap="400">
                <PreviewSurvey survey={surveys[SurveyIndex]} />
                <Box borderRadius="300" minHeight="1rem" />
              </BlockStack>
            </Card>
          </div>
        </BlockStack>
      </InlineGrid>
    </Page>
  );
}

const CardWithSeparateHeader = ({
  index,
  Survey,
  setSurveyIndex,
  HandelSetSurveyInShop,
  MainSurveyId,
}: Cardparms) => {
  const [actionActive, toggleAction] = useState(false);
  const handleToggleAction = () => {
    toggleAction(!actionActive);
  };

  const items = [
    { content: "Edit" },
    { content: "Delete" },
    {
      content: "Set in store",
      onAction: () => {
        HandelSetSurveyInShop(Survey.id);
      },
    },
  ];

  const disclosureButtonActivator = (
    <Button variant="plain" disclosure onClick={handleToggleAction}>
      More
    </Button>
  );

  const disclosureButton = (
    <Popover
      active={actionActive}
      activator={disclosureButtonActivator}
      onClose={handleToggleAction}
    >
      <ActionList items={items} />
    </Popover>
  );

  return (
    <Card roundedAbove="sm" key={index}>
      <BlockStack gap="200">
        <InlineGrid columns="1fr auto">
          <Text as="h2" variant="headingSm">
            {Survey.title}
          </Text>

          <ButtonGroup>
            <Button
              variant="plain"
              onClick={() => {
                setSurveyIndex(index);
              }}
              accessibilityLabel="Preview"
            >
              Preview
            </Button>
            {disclosureButton}
          </ButtonGroup>
        </InlineGrid>
        <List>
          <List.Item> {Survey.typeSurvey} Type</List.Item>
        </List>
        {MainSurveyId === Survey.id && (
          <Text as="span" tone="critical">
            <InlineCode>The Main Survey in the Shop</InlineCode>
          </Text>
        )}
      </BlockStack>
    </Card>
  );
};
function PreviewSurvey({ survey }: SurveyParams) {
  return (
    <BlockStack gap={{ xs: "400", md: "200" }}>
      <Card roundedAbove="sm">
        <BlockStack gap="500">
          <div
            style={{
              boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
              borderBottom: "1px solid #000",
              border: "1px solid #ccc",
              padding: "20px",
              opacity: 1,
              transition: "opacity 1s ease",
            }}
          >
            <BlockStack gap="400">
              <Text variant="headingLg" as="h5">
                {survey.title}
              </Text>
              <Text variant="bodyMd" as="span">
                {survey.subtitle}
              </Text>

              {survey.typeSurvey !== "Form" && (
                <Text variant="headingXs" as="h6">
                  {"Not Form Rendering"}
                </Text>
              )}
              {/* REVIEW: Render the form if Statehook is in from state  */}
              {survey.typeSurvey == "Form" &&
                survey.fields?.map((field: any, i: any) => {
                  if (
                    field.type == "text" ||
                    field.type == "date" ||
                    field.type == "number" ||
                    field.type == "email"
                  ) {
                    return (
                      <TextField
                        key={i}
                        type={field.type}
                        label="Form Title"
                        value={""}
                        autoComplete="off"
                      />
                    );
                  }
                  if (field.type == "select") {
                    return (
                      <div key={i}>
                        <Select
                          label={field.label}
                          options={field.options!}
                          value={"selected"}
                        />
                      </div>
                    );
                  }
                  return (
                    <div key={i}>
                      <ChoiceList
                        title={field.label}
                        choices={field.options!}
                        selected={[""]}
                      />

                      <Box borderRadius="300" minHeight="1rem" />
                    </div>
                  );
                })}
              <Button>Submit</Button>
            </BlockStack>
          </div>
        </BlockStack>
        <Box borderRadius="300" minHeight="auto" />
      </Card>
    </BlockStack>
  );
}
