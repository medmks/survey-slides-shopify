import db from "../db.server";

interface AttributionAnswers {
  suevryname: string;
  type: string;
  order: string;
  Answers: {
    id: number;
    question: string;
    Answer: string;
  }[];
}

export async function GetTheSurvey() {
  const Survey = await db.survey.findFirst({
    where: { RenderInShop: true },
    include: {
      fields: {
        include: {
          options: true,
        },
      },
    },
  });
  if (!Survey) {
    return null;
  }
  return Survey;
}

export async function SaveAttribution(Attribution: AttributionAnswers) {
  const Answers = Attribution.Answers;
  const savingAtt = await db.attribution.create({
    data: {
      suevryname: Attribution.suevryname,
      order: Attribution.order,
      type: Attribution.type,
    },
  });
  if (savingAtt) {
    for (const Answer of Answers) {
      await db.answers.create({
        data: {
          idField: Answer.id,
          answer: Answer.Answer,
          question: Answer.question,
          Attribution: {
            connect: { id: savingAtt.id },
          },
        },
      });
    }
  }

  return { status: "200", Att: savingAtt };
}
export async function GetAllSurveys() {
  const AllSurveys = await db.survey.findMany({
    include: {
      fields: {
        include: {
          options: true,
        },
      },
    },
  });
  if (!AllSurveys) {
    return null;
  }
  return AllSurveys;
}
export async function GetSurveyResponses() {
  const questionCounts = await db.answers.groupBy({
    by: ['question', 'answer'],
    _count: true,
  });
  
  console.log(questionCounts);
  const Res = await db.attribution.findMany({
    include: {
      answers: true
    },
  });
  if (!Res) {
    return null;
  }
  return questionCounts;
}


export async function UpdatetheRenderSurvey(id: number) {
  const surveys = await prisma.survey.findMany();
  for (const survey of surveys) {
    await prisma.survey.update({
      where: {
        id: survey.id,
      },
      data: {
        RenderInShop: false,
      },
    });
  }
  const updatedSurvey = await prisma.survey.update({
    where: {
      id: id,
    },
    data: {
      RenderInShop: true,
    },
  });
  if (!updatedSurvey) {
    return null;
  }
  return updatedSurvey;
}
