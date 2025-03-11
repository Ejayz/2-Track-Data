import { NextRequest, NextResponse } from "next/server";
import * as fs from "fs";

import csv from "csv-parser";
import pg from "pg";
import { createKey } from "next/dist/shared/lib/router/router";

export async function GET(req: NextRequest) {
  const { Client } = pg;


  


  const client = new Client({
    user: "ejayz",
    password: "randomDdos1.com",
    host: "192.168.1.12",
    port: 5432,
    database: "mackup",
  });

  client.connect()

  let results: any = [];

  fs.createReadStream("./public/data_control_customer.csv")
    .pipe(csv())
    .on("data", (data) => results.push(data))
    .on("end", async () => {
      results.forEach(async (result: any, index: any) => {
        console.log(result)
        const customer = result.client;
        const order_fabrication_id = result.order_fabrication_id;
        const interior_diameter =
          result.interior_diameter?parseFloat( result.interior_diameter) : 0;
        const exterior_diameter =
          result.exterior_diameter ? parseFloat(result.exterior_diameter) : 0;
        const length = result.length ? parseFloat(result.length) : 0;
        const flat_crush = result.flat_crush  ? parseFloat(result.flat_crush) : 0;
        const h20 = result.h20  ? parseFloat(result.h20) : 0;
        const radial = result.radial  ? parseFloat( result.radial) : 0;


        const getArticle_id_queries =
          "SELECT id FROM tbl_article WHERE article_name=$1";
        const getArticle = await client.query(getArticle_id_queries, [
          customer,
        ]);
        const article_id = getArticle.rows[0].id;
        const getCustomer_id_queries =
          "SELECT id FROM tbl_customer WHERE company_name=$1";
        const getCustomer = await client.query(getCustomer_id_queries, [
          customer,
        ]);
        const customer_id = getCustomer.rows[0].id;
        console.log(article_id, customer_id);

        const createOrder_form_queries =
          "INSERT INTO tbl_orders_form(article_id,customer_id,order_fabrication_control) VALUES($1,$2,$3) RETURNING id";
        const createOrder_form = await client.query(createOrder_form_queries, [
          article_id,
          customer_id,
          order_fabrication_id,
        ]);
        console.log(createOrder_form.rows[0].id);
        const order_form_id = createOrder_form.rows[0].id;

        const insert_measurement_queries =
          "INSERT INTO tbl_measurement(order_form_id,inside_diameter,outside_diameter,length,flat_crush,h20,radial) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING id";
        const insert_measurement = await client.query(
          insert_measurement_queries,
          [
            order_form_id,
            interior_diameter,
            exterior_diameter,
            length,
            flat_crush,
            h20,
            radial,
          ]
        );
        console.log(insert_measurement.rows[0].id);
        const measurement_id = insert_measurement.rows[0].id;
        console.log(measurement_id);
      });
    });

  return new NextResponse("Hello World", { status: 200 });
}
