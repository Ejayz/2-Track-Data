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
    
    fs.createReadStream('./public/authorization access.csv')
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', () => {
    
        results.forEach((result:any) => {
            const processName=result.Name.split(" ");
          let first_name="";
          let middle_name="";
            let last_name="";
            let role=result.authorization_type

            if(processName.length==2){
                first_name=processName[0];
                last_name=processName[1];
            }else if(processName.length==3){
                first_name=processName[0];
                middle_name=processName[1];
                last_name=processName[2];
            }

            const query = {
                text: 'INSERT INTO tbl_users(first_name, middle_name, last_name, role) VALUES($1, $2, $3, $4)',
                values: [first_name, middle_name, last_name, role],
              }
              try {
                client.query(query)
              } catch (e) {
                console.log(e)
            }

        })


    });

    


return new NextResponse("Hello World", {status: 200});
}