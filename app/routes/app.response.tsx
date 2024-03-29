import type { LoaderFunction } from "@remix-run/node";
import {  useLoaderData } from "@remix-run/react";
import {
  IndexTable,
  LegacyCard,
  Text,
  useBreakpoints,
  Page,
} from "@shopify/polaris";
import { useState } from "react";
import { GetSurveyResponses } from "~/models/survey.server";
import { authenticate } from "~/shopify.server";

interface ResT {
  question : string
  answer:string,
  _count:number
}
export const loader:LoaderFunction =async ({request}) =>{
  await authenticate.admin(request);
  const SurveysResponse = await GetSurveyResponses();
  return SurveysResponse
}


const Dashboard = () => {

  const resSurvey:ResT[] = useLoaderData()
  const [response] = useState(resSurvey);
  

  return (
    <Page
      backAction={{ content: "Products", url: "" }}
      title="Survey Responses"
      pagination={{
        hasPrevious: true,
        hasNext: true,
      }}
    >
      <Text as="h1" variant="heading2xl">
        Response
      </Text>
      <ResponseTable/>
    </Page>
  );
  function ResponseTable(){
    const rowMarkup = response.map((res,i) => {
      return (
        <IndexTable.Row  id={i.toString()} key={i} position={i}>
          <IndexTable.Cell >
            survey
          </IndexTable.Cell>
    
          <IndexTable.Cell >
            <Text variant="bodyMd" fontWeight="bold" as="span" >
            {res.question}
            </Text>
          </IndexTable.Cell> 
    
          <IndexTable.Cell>
            <Text as="span" numeric variant="bodyMd"  alignment="justify" >
              {res.answer}
            </Text>  
          </IndexTable.Cell> 
    
          <IndexTable.Cell>
    
          <IndexTable.Cell> 
              <Text as="span" >
                <span style={{
                      backgroundColor: 'grey', 
                      borderRadius:"30px",
                      color:"white",
                      padding:"5px",   
                      height: '60px',   
                      objectFit: 'cover' 
                    }}>
    
                {res._count} 
                </span>
              </Text>
          </IndexTable.Cell>
    
          </IndexTable.Cell>
    
        </IndexTable.Row>
      )
    }
    );
    return (
      <LegacyCard>
      <IndexTable
        condensed={useBreakpoints().lgDown}
        resourceName={{
          singular: "product",
          plural: "products",
        }}
        itemCount={4}
        headings={[
          { title: "Survey" },
          { title: "Question" },
          { title: "Answer" },
          { title: "Person" },
        ]}
        selectable={false}
      >
      {rowMarkup}

      </IndexTable>
    </LegacyCard>
    )

  }


};

export default Dashboard;




