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
  const rowMarkup =   response.map((res,i) => {
    return (
      <IndexTable.Row id={i.toString()} key={i} position={i}>
        <IndexTable.Cell>
  
          survey
          
        </IndexTable.Cell>
  
        <IndexTable.Cell>
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

  // const RowMarkup = (Res:any) => {
  //   return (
  //     <IndexTable.Row id={""} position={1} >
  //       <IndexTable.Cell>Survey</IndexTable.Cell>

  //       <IndexTable.Cell>
  //         <Text variant="bodyMd" fontWeight="bold" as="span">
  //           {Res.question}
  //         </Text>
  //       </IndexTable.Cell>

  //       <IndexTable.Cell>
  //         <Text as="span" numeric variant="bodyMd" alignment="justify">
  //           {Res.answer}
  //         </Text>
  //       </IndexTable.Cell>

  //       <IndexTable.Cell>
  //         <IndexTable.Cell>
  //           <Text as="span">
  //             <span
  //               style={{
  //                 backgroundColor: "grey",
  //                 borderRadius: "30px",
  //                 color: "white",
  //                 padding: "5px",
  //                 height: "60px",
  //                 objectFit: "cover",
  //               }}
  //             >
  //               {Res._count}
  //             </span>
  //           </Text>
  //         </IndexTable.Cell>
  //       </IndexTable.Cell>
  //     </IndexTable.Row>
  //   );
  // };

  return (
    <Page
      backAction={{ content: "Products", url: "" }}
      title="Survey Responses"
      pagination={{
        hasPrevious: true,
        hasNext: true,
      }}
    >
      <LegacyCard>
        <IndexTable
          condensed={useBreakpoints().lgDown}
          resourceName={{
            singular: "product",
            plural: "products",
          }}
          itemCount={4}
          // _count: 1, question: 'Your city?', answer: 'taza'}
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
    </Page>
  );
};

export default Dashboard;




