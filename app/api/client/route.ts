import { NextRequest, NextResponse } from "next/server";
import * as fs from "fs";

import csv from "csv-parser";
import pg from "pg";

export async function GET(req:NextRequest){
    const { Client } = pg

      // Create a new client instance
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
    let results:any = [];
    
    fs.createReadStream('./public/clients.csv')
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', () => {
    
        results.forEach((result:any) => {
          const client_name=result.client
          console.log(client_name)

          const query = {
              text: 'INSERT INTO tbl_customer(company_name,user_id) VALUES($1,$2)',
              values: [client_name,'032a73dd-07b6-46e3-aa3d-00762becae23'],
            }
            try {
              client.query(query.text,query.values)
            } catch (e:any) {
              console.log(e.code,e.hint)
          }

        })


    });

    


return new NextResponse("Hello World", {status: 200});
}