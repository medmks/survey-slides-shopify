import {
  reactExtension,
  BlockStack,
  View,
  Heading,
  Text,
  ChoiceList,
  Choice,
  Button,
  useStorage,
  useApi,
  TextField,
  Select,
} from "@shopify/ui-extensions-react/checkout";
import { DateField } from "@shopify/ui-extensions/checkout";
import { useCallback, useEffect, useState } from "react";

// [START order-status.extension-point]
// Allow the attribution survey to display on the thank you page.
const thankYouBlock = reactExtension("purchase.thank-you.block.render", () => (
  <Attribution />
));
export { thankYouBlock };

const orderDetailsBlock = reactExtension(
  "customer-account.order-status.block.render",
  () => <ProductReview />,
);
export { orderDetailsBlock };

function Attribution() {
  // const [attribution, setAttribution] = useState("");
  const [attributionCustomer, setAttributionCustomer] = useState({
    suevryname: "",
    type: "",
    order: "",
    Answers: [
      {
        id: 0,
        question: "",
        answer: [""],
      },
    ],
  });
  const { sessionToken, lines } = useApi();
  const [survey, setSurvey] = useState();
  const [loading, setLoading] = useState(false);

  const updateAnswer = (newAnswer, questionId) => {
    setAttributionCustomer((prevState) => {
      const updatedAnswers = prevState.Answers.map((answer) =>
        answer.id === questionId ? { ...answer, Answer: newAnswer } : answer,
      );
      return {
        ...prevState,
        Answers: updatedAnswers,
      };
    });

    console.log("====questionId, newAnswer=====");
    console.log(attributionCustomer);
  };

  const [attributionSubmitted, setAttributionSubmitted] = useStorageState(
    "attribution-submitted",
  );
  //b⬇ handleSubmit Function ✨;
  // async function handleSubmit() {
  //   // Simulate a server request
  //   setLoading(true);
  //   return new Promise((resolve) => {
  //     setTimeout(() => {
  //       console.log("Submitted:", attribution);
  //       setLoading(false);
  //       setAttributionSubmitted(true);
  //       resolve();
  //     }, 750);
  //   });
  // }

  async function handleSubmit() {
    const token = await sessionToken.get();
    setLoading(true);

    try {
      const response = await fetch(
        "https://toy-books-tim-half.trycloudflare.com/api/survey",
        {
          method: "POST",
          mode: "cors",
          credentials: "include",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(attributionCustomer),
        },
      );

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      console.log("Server response:", data);

      setLoading(false);
      setAttributionSubmitted(true);
    } catch (error) {
      console.error("Error submitting data:", error);
      setLoading(false);
    }
  }

  useEffect(() => {
    async function FetchSurvey(token) {
      const res = fetch(
        "https://toy-books-tim-half.trycloudflare.com/api/survey",
        {
          method: "GET",
          mode: "cors",
          credentials: "include",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      )
        .then((res) => {
          return res.json();
        })
        .then((data) => {
          return data;
        });

      return res;
    }

    async function queryApi() {
      const token = await sessionToken.get();
      const Cartline = lines.current[0].merchandise.product.id;
      const TheSurvey = await FetchSurvey(token);
      setSurvey(TheSurvey);
      const QuestionsAnswers = TheSurvey.fields.map((field) => {
        return { id: field.id, question: field.label, Answer: [""] };
      });
      const newState = {
        suevryname: TheSurvey.title,
        type: TheSurvey.typeSurvey,
        order: Cartline,
        Answers: QuestionsAnswers,
      };
      console.log(newState);
      setAttributionCustomer((prev) => newState);

      return null;
    }
    queryApi();
  }, [lines, sessionToken]);

  if (survey) {
    return (
      <PreviewSurvey
        survey={survey}
        handleSubmit={handleSubmit}
        loading={loading}
        updateAnswer={updateAnswer}
      />
    );
  }
  if (attributionSubmitted.loading || attributionSubmitted.data === true) {
    return null;
  }
  // return (
  //   <Survey
  //     title="How did you hear about us ?"
  //     onSubmit={handleSubmit}
  //     loading={loading}
  //   >
  //     <ChoiceList
  //       name="sale-attribution"
  //       value={attribution}
  //       onChange={setAttribution}
  //     >
  //       <BlockStack>
  //         <Choice id="tv">TV</Choice>
  //         <Choice id="podcast">Podcast</Choice>
  //         <Choice id="family">From a friend or family member</Choice>
  //         <Choice id="tiktok">Tiktok</Choice>
  //       </BlockStack>
  //     </ChoiceList>
  //   </Survey>
  // );
}

function ProductReview() {
  const [productReview, setProductReview] = useState("");
  const [loading, setLoading] = useState(false);
  // Store into local storage if the product was reviewed by the customer.
  const [productReviewed, setProductReviewed] =
    useStorageState("product-reviewed");

  async function handleSubmit() {
    // Simulate a server request
    setLoading(true);
    return new Promise((resolve) => {
      setTimeout(() => {
        // Send the review to the server
        console.log("Submitted:", productReview);
        setLoading(false);
        setProductReviewed(true);
        resolve();
      }, 750);
    });
  }

  // Hides the survey if the product has already been reviewed
  if (productReviewed.loading || productReviewed.data) {
    return null;
  }

  return (
    <Survey
      title="How do you like your purchase?"
      description="We would like to learn if you are enjoying your purchase."
      onSubmit={handleSubmit}
      loading={loading}
    >
      <ChoiceList
        name="product-review"
        value={productReview}
        onChange={setProductReview}
      >
        <BlockStack>
          <Choice id="5">Amazing! Very happy with it.</Choice>
          <Choice id="4">It's okay, I expected more.</Choice>
          <Choice id="3">Eh. There are better options out there.</Choice>
          <Choice id="2">I regret the purchase.</Choice>
        </BlockStack>
      </ChoiceList>
    </Survey>
  );
}

function Survey({ title, description, onSubmit, children, loading }) {
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit() {
    await onSubmit();
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <View border="base" padding="base" borderRadius="base">
        <BlockStack>
          <Heading>Thanks for your feedback!</Heading>
          <Text>Your response has been submitted</Text>
        </BlockStack>
      </View>
    );
  }

  return (
    <View border="base" padding="base" borderRadius="base">
      <BlockStack>
        <Heading>{title}</Heading>
        <Text>{description}</Text>
        {children}
        <Button kind="secondary" onPress={handleSubmit} loading={loading}>
          Submit feedback
        </Button>
      </BlockStack>
    </View>
  );
}

/**
 * Returns a piece of state that is persisted in local storage, and a function to update it.
 * The state returned contains a `data` property with the value, and a `loading` property that is true while the value is being fetched from storage.
 */
function useStorageState(key) {
  const storage = useStorage();
  const [data, setData] = useState();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function queryStorage() {
      const value = await storage.read(key);
      setData(value);
      setLoading(false);
    }

    queryStorage();
  }, [setData, setLoading, storage, key]);

  const setStorage = useCallback(
    (value) => {
      storage.write(key, value);
    },
    [storage, key],
  );

  return [{ data, loading }, setStorage];
}
function PreviewSurvey({ survey, updateAnswer, loading, handleSubmit }) {
  const [submitted, setSubmitted] = useState(false);

  async function HandelPressSubmit() {
    await handleSubmit();
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <View border="base" padding="base" borderRadius="base">
        <BlockStack>
          <Heading>Thanks for your Time ✨</Heading>
          <Text>Your response has been submitted</Text>
        </BlockStack>
      </View>
    );
  }
  return (
    <View border="base" padding="base" borderRadius="base">
      <BlockStack gap={{ xs: "400", md: "200" }}>
        <Heading>{survey.title}</Heading>
        <Text>{survey.subtitle}</Text>
        {survey.typeSurvey !== "Form" && (
          <Text variant="headingXs" as="h6">
            {"Not Form Rendering"}
          </Text>
        )}
        {survey.typeSurvey == "Form" &&
          survey.fields?.map((field, i) => {
            if (field.type == "date") {
              return (
                <DateField
                  key={i}
                  label={field.label}
                  onChange={(e) => {
                    updateAnswer(e, field.id);
                  }}
                />
              );
            }
            if (
              field.type == "text" ||
              field.type == "number" ||
              field.type == "email"
            ) {
              return (
                <TextField
                  key={i}
                  type={field}
                  label={field.label}
                  value={""}
                  autoComplete="off"
                  onChange={(e) => {
                    updateAnswer(e, field.id);
                  }}
                />
              );
            }
            if (field.type == "select") {
              return (
                <BlockStack key={i}>
                  <Select
                    label={field.label}
                    options={field.options}
                    value={"selected"}
                    onChange={(value) => {
                      updateAnswer(value, field.id);
                    }}
                  />
                </BlockStack>
              );
            }
            if (field.type == "checkbox") {
              return (
                <BlockStack key={i}>
                  <Text>{field.label}</Text>
                  <ChoiceList
                    name="gift"
                    value={"gift-1"}
                    onChange={(value) => {
                      updateAnswer(value, field.id);
                    }}
                  >
                    {field.options.map((options, o) => {
                      return (
                        <BlockStack key={o}>
                          <Choice id={options.label} key={o}>
                            {options.label}
                          </Choice>
                        </BlockStack>
                      );
                    })}
                  </ChoiceList>
                </BlockStack>
              );
            }

            return (
              <BlockStack key={i}>
                <ChoiceList
                  title={field.label}
                  choices={field.options}
                  selected={[""]}
                />
              </BlockStack>
            );
          })}
        <Button kind="secondary" onPress={HandelPressSubmit} loading={loading}>
          Submit feedback
        </Button>
      </BlockStack>
    </View>
  );
}
