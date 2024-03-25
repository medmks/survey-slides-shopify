import {
  BlockStack,
  Box,
  Card,
  InlineGrid,
  Button,
  TextField,
  Page,
  Select,
  Text,
  ChoiceList,
} from "@shopify/polaris";
import db from "./../db.server";
import {
  PlusIcon,
  DuplicateIcon,
  DeleteIcon,
  SaveIcon,
} from "@shopify/polaris-icons";
import { useState, useCallback } from "react";
import type { Type } from "@shopify/polaris/build/ts/src/components/TextField";
import type { ActionFunctionArgs } from "@remix-run/node";
import { useSubmit } from "@remix-run/react";
export type TypeSurvey = {
  id: number;
  title: string;
  typeSurvey: string;
  subtitle: string;
  fields: fieldtypes[];
  RenderInShop?: boolean;
};
type fieldtypes = {
  id: number;
  surveyId: number;
  type: string | Type | undefined;
  label: string;
  required?: boolean;
  options?: any;
};
export type SurveyParams = {
  survey: TypeSurvey;
};
type SurveyParamsVoid = {
  survey: any;
  handleChangeFieldTitle: (newValue: string, idField: number) => void;
  handleSelectChangeType: (TypeField: Type, idField: number) => void;
  AddNewField: () => void;
  DeleteField: (id: number) => void;
  HandelRequirementField: (selected: string[], idField: number) => void;
  HandelTheAnswerOption: (
    NewAnswerTitle: string,
    idFieldoption: number,
    AnswerId: string | undefined,
  ) => void;
  AddOption: (idField: number) => void;
  DeleteOption: (optionId: string, idField: number) => void;
};

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();

  const fieldsData = formData.get("fields")?.toString();

  if (!fieldsData) {
    console.error("Missing 'fields' data in form data");
    return;
  }

  const fields = JSON.parse(fieldsData);

  const parsedFields = fields.map((field: fieldtypes) => ({
    ...field,
    options: field.options?.map((option: any) => ({
      id: option.id,
      label: option.label,
      value: option.value,
    })),
  }));

  const surveyData = {
    title: formData.get("Surveytitle") as string,
    typeSurvey: formData.get("typeSurvey") as string,
    subtitle: formData.get("SurveySubtitle") as string,
    RenderInShop: false,
  };

  console.log(surveyData);

  try {
    // Include "options" creation if you updated the Survey model
    const savedSurvey = await db.survey.create({
      data: surveyData,
    });
    for (const field of parsedFields) {
      const CreateField = await db.field.create({
        data: {
          label: field.label,
          type: field.type,
          survey: {
            connect: { id: savedSurvey.id },
          },
        },
      });
      if (field.options) {
        for (const option of field.options) {
          await db.option.create({
            data: {
              label: option.label,
              value: option.value,
              Field: {
                connect: { id: CreateField.id },
              },
            },
          });
        }
      }
    }
    return { success: true, survey: savedSurvey };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to save survey." };
  }

  return null;
}

export default function ResourceDetailsLayout() {
  const [surveyTest, setsurveyTest] = useState<TypeSurvey>({
    id: 1,
    title: "We will wish a happy birthday",
    typeSurvey: "Form",
    subtitle: "",
    fields: [
      {
        id: 1,
        surveyId: 1,
        type: "date",
        label: "Enter your BirthDay",
        required: false,
      },
    ],
  });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const submit = useSubmit();
  function handleSave() {
    const formData = new FormData();

    formData.append("Surveytitle", surveyTest.title);
    formData.append("SurveySubtitle", surveyTest.subtitle);
    formData.append("typeSurvey", surveyTest.typeSurvey);
    formData.append("fields", JSON.stringify(surveyTest.fields));

    // const data = {
    //   title:surveyTest.title,
    //   fields:surveyTest.fields
    // }

    submit(formData, { method: "post" });
  }

  const handleChangeSurveyTitle = useCallback(
    (newValue: string) =>
      setsurveyTest((prevState) => ({
        ...prevState,
        title: newValue,
      })),
    [],
  );

  const handleChangeFieldTitle = (newValue: string, idField: number) => {
    setsurveyTest((prevState) => {
      const updatedFields = prevState.fields.map((field) => {
        if (field.id === idField) {
          return { ...field, label: newValue };
        }
        return field;
      });

      return {
        ...prevState,
        inputes: updatedFields,
      };
    });
  };

  const handleSelectChangeType = (TypeField: Type, idField: number) => {
    setsurveyTest((Prev) => {
      const UpadtedField = Prev.fields.map((F) => {
        if (F.id == idField) {
          if (F.type == "text" && (TypeField! as Type)) {
            return {
              ...F,
              type: TypeField,
              options: [
                {
                  id: "1",
                  fieldId: F.id,
                  label: "Option 1",
                  value: "Option 1",
                },
              ],
            };
          }
          return { ...F, type: TypeField };
        }
        return F;
      });

      return {
        ...Prev,
        fields: UpadtedField,
      };
    });
    console.log(surveyTest);
  };

  const AddNewField = () => {
    const IdField = surveyTest.fields.length + 1;
    const NewField = {
      id: IdField,
      surveyId: surveyTest.id,
      type: "text",
      label: "Text Field",
      required: false,
    };
    setsurveyTest((Prev) => ({ ...Prev, fields: [...Prev.fields, NewField] }));
  };
  const AddOption = (idField: number) => {
    const OptionsLenght: String = (
      surveyTest.fields.find((F) => F.id == idField)?.options.length + 1
    ).toString();
    const NewOption = {
      id: OptionsLenght,
      label: `Option ${OptionsLenght}`,
      value: `Option ${OptionsLenght}`,
    };

    const Field = surveyTest.fields.map((field) => {
      if (field.id == idField) {
        return { ...field, options: [...field.options, NewOption] };
      }
      return field;
    });

    setsurveyTest((Prev) => ({
      ...Prev,
      fields: Field,
    }));
  };
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const DeleteOption = (idOption: string, idField: number) => {
    const Field = surveyTest.fields.map((field) => {
      if (field.id == idField) {
        const FiltredOptions = field.options.filter(
          (Option: any) => Option.id !== idOption,
        );
        return { ...field, options: FiltredOptions };
      }
      return field;
    });

    setsurveyTest((Prev) => ({
      ...Prev,
      fields: Field,
    }));
  };
  const DeleteField = (id: number) => {
    const FilteredFields = surveyTest.fields?.filter(
      (field) => field.id !== id,
    );

    if (FilteredFields) {
      setsurveyTest((Prev) => ({
        ...Prev,
        fields: FilteredFields,
      }));
    }
  };
  // const HandelTheAnswerOption = (
  //   newLabel: string,
  //   optionsId: number,
  //   answerId: string | undefined,
  // ) => {
  //   setsurvey((prevState) => {
  //     const updatedOptionsfilds = prevState.inputes.Optionsfilds!.map(
  //       (option) => {
  //         if (option.id === optionsId) {
  //           const updatedAnsewers = option.Ansewers.map((answer) => {
  //             if (answer.id == answerId) {
  //               return { ...answer, label: newLabel, value: newLabel };
  //             }
  //             return answer;
  //           });

  //           //REVIEW Update the Ansewers array for the specified Optionsfild
  //           return { ...option, Ansewers: updatedAnsewers };
  //         }
  //         return option;
  //       },
  //     );

  //     return {
  //       ...prevState,
  //       inputes: {
  //         ...prevState.inputes,
  //         Optionsfilds: updatedOptionsfilds,
  //       },
  //     };
  //   });
  // };
  const HandelTheAnswerOption = () => {};

  const HandelRequirementField = (selected: string[], idField: number) => {
    if (selected[0] == "optional") {
      console.log(selected);

      setsurveyTest((Prev) => {
        const UpdatedField = Prev.fields.map((Field) => {
          if (idField == Field.id) {
            return { ...Field, required: false };
          }
          return Field;
        });
        return {
          ...Prev,
          fields: UpdatedField,
        };
      });
      return null;
    }
    setsurveyTest((Prev) => {
      const UpdatedField = Prev.fields.map((Field) => {
        if (idField == Field.id) {
          return { ...Field, required: true };
        }
        return Field;
      });
      return {
        ...Prev,
        fields: UpdatedField,
      };
    });
    console.log(surveyTest);
  };
  function SelectFormType() {
    const handleSelectChange = (newValue: string) => {
      setsurveyTest((Prev) => ({ ...Prev, typeSurvey: newValue }));
    };
    const options = [
      { label: "Checklist", value: "Checklist" },
      { label: "Form", value: "Form" },
    ];

    return (
      <Select
        tone="magic"
        label="Select survey Format"
        options={options}
        onChange={handleSelectChange}
        value={surveyTest.typeSurvey}
      />
    );
  }

  return (
    <Page
      backAction={{ content: "Products", url: "" }}
      title="Create new Survey "
      secondaryActions={[
        {
          content: "Duplicate",
          icon: DuplicateIcon,
          accessibilityLabel: "Secondary action label",
          onAction: () => alert("Duplicate action"),
        },
        {
          content: "Save",
          icon: SaveIcon,
          accessibilityLabel: "Secondary action label",
          onAction: handleSave,
        },
        {
          content: "Delete",
          icon: DeleteIcon,
          destructive: true,
          accessibilityLabel: "Secondary action label",
          onAction: () => {
            alert("Are you sure you want to delete it ?");
          },
        },
      ]}
      pagination={{
        hasPrevious: true,
        hasNext: true,
      }}
    >
      <InlineGrid columns={{ xs: 2, md: "2fr 2fr" }} gap="400">
        <BlockStack gap="400">
          <Card roundedAbove="sm">
            <BlockStack gap="400">
              <Text variant="headingLg" as="h5">
                {"Survey Format "}
              </Text>
              <SelectFormType />
              <Box borderRadius="300" minHeight="1rem" />
            </BlockStack>
            <BlockStack gap="400">
              <Text variant="headingLg" as="h5">
                {"Survey Content"}
              </Text>
              <TextField
                label="Form Title"
                onChange={handleChangeSurveyTitle}
                value={surveyTest.title}
                autoComplete="off"
              />
              <TextField
                label="SubTitle"
                onChange={handleChangeSurveyTitle}
                autoComplete="off"
                value={surveyTest.subtitle}
              />
              <Box borderRadius="300" minHeight="1rem" />
            </BlockStack>
            <SurveyForm
              AddOption={AddOption}
              HandelRequirementField={HandelRequirementField}
              handleChangeFieldTitle={handleChangeFieldTitle}
              handleSelectChangeType={handleSelectChangeType}
              AddNewField={AddNewField}
              DeleteField={DeleteField}
              HandelTheAnswerOption={HandelTheAnswerOption}
              survey={surveyTest}
              DeleteOption={DeleteOption}
            />
          </Card>
        </BlockStack>
        <PreviewSurvey survey={surveyTest} />
      </InlineGrid>
    </Page>
  );
}

function SurveyForm({
  survey,
  handleChangeFieldTitle,
  handleSelectChangeType,
  AddNewField,
  DeleteField,
  HandelTheAnswerOption,
  HandelRequirementField,
  AddOption,
  DeleteOption,
}: SurveyParamsVoid) {
  const TypesOfinputes = [
    { label: "Short Answer", value: "text" },
    { label: "Date", value: "date" },
    { label: "Email", value: "email" },
    { label: "Select", value: "select" },
    { label: "checkbox", value: "checkbox" },
  ];

  // TODO: Add preRender Component Survey here ⬇
  // if (survey.type !== "Form") {
  //   return (
  //     <BlockStack gap="400">
  //       <Text variant="headingLg" as="h5">
  //         {"Answer Options"}
  //       </Text>
  //       {/* {survey.inputes.Optionsfilds?.map((option, i) => {
  //         return (
  //           <div key={i}>
  //             <BlockStack gap="400">
  //               {option.Ansewers.map((Answer, i) => {
  //                 return (
  //                   <div key={i}>
  //                     <Text variant="headingXs" as="h6">
  //                       Options {Answer.id}
  //                     </Text>
  //                     <TextField
  //                       onChange={(e) => {
  //                         HandelTheAnswerOption(e, option.id, Answer.id);
  //                       }}
  //                       label=""
  //                       value={Answer.value}
  //                       type={"text"}
  //                       autoComplete="off"
  //                     />
  //                   </div>
  //                 );
  //               })}
  //               <Button
  //                 // onClick={() => {
  //                 //   AddNewField();
  //                 // }}
  //                 variant="plain"
  //                 tone="critical"
  //                 icon={PlusIcon}
  //               >
  //                 More Options{" "}
  //               </Button>
  //               <Button
  //                 // onClick={() => {
  //                 //   AddNewField();
  //                 // }}
  //                 variant="primary"
  //                 tone="success"
  //                 icon={PlusIcon}
  //               >
  //                 Add Field In{" "}
  //               </Button>
  //             </BlockStack>
  //           </div>
  //         );
  //       })} */}
  //     </BlockStack>
  //   );
  // }

  return (
    <BlockStack gap="400">
      <Text variant="headingLg" as="h5">
        {"Fields Content "}
      </Text>
      {survey.fields.map((field: fieldtypes, i: any) => {
        if (
          field.type == "text" ||
          field.type == "date" ||
          field.type == "number" ||
          field.type == "email"
        ) {
          return (
            <BlockStack gap="400" key={i}>
              <div
                style={{
                  borderBottom: "1px solid #000",
                  textAlign: "center",
                  padding: "4px",
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    padding: "0px",
                    color: "",
                    fontSize: "18px",
                    fontFamily: "sans-serif",
                  }}
                >
                  Field {field.id}
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                  }}
                >
                  <Button
                    onClick={() => {
                      DeleteField(field.id);
                    }}
                    icon={DeleteIcon}
                  ></Button>
                </div>
              </div>
              <InlineGrid gap="400" columns={2}>
                <Select
                  label="Select type field "
                  options={TypesOfinputes}
                  onChange={(e: Type) => {
                    handleSelectChangeType(e, field.id);
                  }}
                  value={field.type}
                />
                <ChoiceList
                  title="PRIORITY"
                  onChange={(e) => {
                    HandelRequirementField(e, field.id);
                  }}
                  choices={[
                    { label: "Optional", value: "optional" },
                    { label: "Required", value: "required" },
                  ]}
                  selected={field.required ? ["required"] : ["optional"]}
                />
              </InlineGrid>

              <TextField
                label="Field Title"
                type={"text"}
                onChange={(e) => {
                  handleChangeFieldTitle(e, field.id);
                }}
                value={field.label}
                autoComplete="off"
              />
            </BlockStack>
          );
        }

        return (
          <BlockStack gap="400" key={i}>
            <div
              style={{
                borderBottom: "1px solid #000",
                textAlign: "center",
                padding: "4px",
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  padding: "0px",
                  color: "",
                  fontSize: "18px",

                  fontFamily: "sans-serif",
                }}
              >
                Field {field.id}
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                }}
              >
                <Button
                  onClick={() => {
                    DeleteField(field.id);
                  }}
                  icon={DeleteIcon}
                ></Button>
              </div>
            </div>
            <InlineGrid gap="400" columns={2}>
              <Select
                label="Select type field "
                options={TypesOfinputes}
                onChange={(e: Type) => {
                  handleSelectChangeType(e, field.id);
                }}
                value={field.type}
              />
              <ChoiceList
                onChange={(e) => {
                  HandelRequirementField(e, field.id);
                }}
                title="PRIORITY"
                choices={[
                  { label: "Optional", value: "optional" },
                  { label: "Required", value: "required" },
                ]}
                selected={field.required ? ["required"] : ["optional"]}
              />
            </InlineGrid>
            <Text variant="headingSm" as="h6">
              Options
            </Text>
            {field.options?.map((Option: any, i: number) => {
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    flexDirection: "row",
                  }}
                >
                  <TextField
                    value={Option.value}
                    label=""
                    type="text"
                    autoComplete="off"
                  />
                  <Button
                    onClick={() => DeleteOption(Option.id, field.id)}
                    variant="plain"
                    tone="critical"
                    icon={DeleteIcon}
                  >
                    {" "}
                  </Button>
                </div>
              );
            })}
            <Button
              variant="plain"
              tone="critical"
              onClick={() => {
                AddOption(field.id);
              }}
              icon={PlusIcon}
            >
              More Options{" "}
            </Button>
          </BlockStack>
        );
      })}

      <Button
        onClick={() => {
          AddNewField();
        }}
        variant="primary"
        tone="success"
        icon={PlusIcon}
      >
        Add Field In{" "}
      </Button>
    </BlockStack>
  );
}

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
                survey.fields?.map((field, i) => {
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

                      <Box borderRadius="300" minHeight="1.5rem" />
                    </div>
                  );
                })}
              <Button>Submit</Button>
            </BlockStack>
          </div>
        </BlockStack>
      </Card>
    </BlockStack>
  );
}
