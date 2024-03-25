import type {
  LoaderFunction,
  LoaderFunctionArgs,
  ActionFunction,
  ActionFunctionArgs,
} from "@remix-run/node";
import { json } from "@remix-run/node";
import { authenticate } from "~/shopify.server";
import { GetTheSurvey, SaveAttribution } from "~/models/survey.server";

export const loader: LoaderFunction = async ({
  request,
}: LoaderFunctionArgs) => {
  await authenticate.public.checkout(request);
  const { cors } = await authenticate.public.checkout(request);

  const Survey = await GetTheSurvey();
  return cors(json(Survey));
};
export const action: ActionFunction = async ({
  request,
}: ActionFunctionArgs) => {
  await authenticate.public.checkout(request);

  const contentType = request.headers.get("content-type");

  if (contentType?.includes("application/json")) {
    const data = await request.json();
    const SavedAtt = await SaveAttribution(data);

    return SavedAtt;
  }
};
