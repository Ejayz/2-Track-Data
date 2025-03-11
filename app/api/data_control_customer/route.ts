import { NextRequest, NextResponse } from "next/server";
import * as fs from "fs";

import csv from "csv-parser";
import pg from "pg";
import { createKey } from "next/dist/shared/lib/router/router";

export async function GET(req: NextRequest) {
  const { Client } = pg;

    // // Create a new client instance
    // const client = new Client({
    //   user: "postgres.wczjtpkvkajyufysgkff",
    //   password: "2TrackQCMSDB.",
    //   host: "aws-0-ap-southeast-1.pooler.supabase.com",
    //   port: 6543,
    //   database: "postgres",
    // });
    

    const client = new Client({
      user: "ejayz",
      password: "randomDdos1.com",
      host: "192.168.1.12",
      port: 5432,
      database: "mackup",
    });
  

    // Connect to the database
    client.connect()
      .then(() => {
        console.log("Connected to the database");
      })
      .catch((err) => {
        console.error("Error connecting to the database:", err.message);
      });
    

console.log(client)
  let results: any = [];

  fs.createReadStream("./public/finished_product_quality_specification.csv")
    .pipe(csv())
    .on("data", (data) => results.push(data))
    .on("end", async () => {
      results.forEach(async(result: any,index:any) => {
        if(index==100){
          return;
        }
        const client_name = result.client
        const length = result.length
        const interior_diameter = result.interior_diameter
        const exterior_diamter = result.exterior_diameter
        const flat_crush = result.flat_crush
        const h20 = result.h20

        const processed_length =await nominal_min_max_processor(length);
        const processed_exterior_diameter =await nominal_min_max_processor(exterior_diamter);
        const processed_interior_diameter =await nominal_min_max_processor(interior_diameter);
        const processed_flat_crush =await nominal_min_max_processor(flat_crush);
        const processed_h20 =await nominal_min_max_processor(h20);


        console.log(processed_length,processed_exterior_diameter,processed_interior_diameter,processed_flat_crush,processed_h20)



        const insertArticle_Max= "INSERT INTO tbl_article_max ( length, inside_diameter, outside_diameter, flat_crush, h20,is_exist,user_id) VALUES ($1, $2, $3, $4, $5, $6 , $7) RETURNING id";
        const insertArticle_Min= "INSERT INTO tbl_article_min ( length, inside_diameter, outside_diameter, flat_crush, h20,is_exist,user_id) VALUES ($1, $2, $3, $4, $5, $6 , $7) RETURNING id";
        const insertArticle_Nominal= "INSERT INTO tbl_article_nominal ( length, inside_diameter, outside_diameter, flat_crush, h20,is_exist,user_id) VALUES ($1, $2, $3, $4, $5, $6 , $7) RETURNING id";
        const insertArticle_Max_Values = [processed_length.max, processed_interior_diameter.max, processed_exterior_diameter.max, processed_flat_crush.max, processed_h20.max, true, "032a73dd-07b6-46e3-aa3d-00762becae23"];
        const insertArticle_Min_Values = [processed_length.min, processed_interior_diameter.min, processed_exterior_diameter.min, processed_flat_crush.min, processed_h20.min, true,"032a73dd-07b6-46e3-aa3d-00762becae23"];
        const insertArticle_Nominal_Values = [processed_length.nominal, processed_interior_diameter.nominal, processed_exterior_diameter.nominal, processed_flat_crush.nominal, processed_h20.nominal, true,"032a73dd-07b6-46e3-aa3d-00762becae23"];
    



        const max= await client.query(insertArticle_Max, insertArticle_Max_Values)
      const min=await  client.query(insertArticle_Min, insertArticle_Min_Values)
      const nominal= await client.query(insertArticle_Nominal, insertArticle_Nominal_Values)
     
      let article_max_id = max.rows[0].id;
      let article_min_id = min.rows[0].id;
      let article_nominal_id = nominal.rows[0].id;


console.log(article_max_id,article_min_id,article_nominal_id)

        const insertArticle= "INSERT INTO tbl_article ( article_nominal,article_max,article_min,number_control,article_name ,user_id) VALUES ($1, $2, $3, $4, $5, $6)";
        const insertArticle_Values = [article_nominal_id,article_max_id,article_min_id,0,client_name, '032a73dd-07b6-46e3-aa3d-00762becae23'];
        client.query(insertArticle, insertArticle_Values, (err, res) => {
          if (err) {
            console.log(err.stack)
    
            } else {
           console.log(res)

            }
        }
        );



      });
    });

  return new NextResponse("Hello World", { status: 200 });
}

const nominal_min_max_processor =async  (data: any) => {
  let min ;
  let max;
  let nominal ;
  const space_split = data.split(" ");
  nominal = parseFloat(space_split[0]);
  const slash_split = space_split[2].split("/");
  min = parseFloat(slash_split[0]);
  max = parseFloat(slash_split[1]);
console.log("Minx:",min,max,nominal)
  return {
    min: min,
    max: max,
    nominal: nominal,
  };
};
