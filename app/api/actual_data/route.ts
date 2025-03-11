import { NextRequest, NextResponse } from "next/server";
import * as fs from "fs";
import { DateTime } from "luxon";
import csv from "csv-parser";
import pg from "pg";

export async function GET(req: NextRequest) {
  const { Client } = pg;

  // Create a new client instance
  const clients = new Client({
    user: "postgres.rhpimflqpxvdnqeaoqfz",
    password: "2TrackQCMSDB.",
    host: "aws-0-ap-southeast-1.pooler.supabase.com",
    port: 6543,
    database: "postgres",
  });

  // const clients = new Client({
  //   user: "postgres",
  //   password: "randomDdos1.com",
  //   host: "172.16.1.129",
  //   port: 5432,
  //   database: "postgres",
    
  // });

  // Connect to the database
  clients
    .connect()
    .then(() => {
      console.log("Connected to the database");
    })
    .catch((err) => {
      console.error("Error connecting to the database:", err.message);
    });

  let results: any = [];

  fs.createReadStream("./public/exports/actual_data.csv")
    .pipe(csv())
    .on("data", (data) => results.push(data))
    .on("end", async () => {
      for (const [index, data] of results.entries()) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        // Simulating delay
        console.log(
          `Processing row ${index} with OF ID: ${data.of_id}`
        );
   
        console.log(`Inserting Order Fabrication.`);
        const last_row = await insert_order_fabrication_data(clients, data);

        console.log(`Done inserting order fabrication. Return ${last_row}`);

        const controler_id = await getControlerId(data.controler, clients);

        const collected_measurements = await collect_measurement(
          clients,
          controler_id,
          data
        );

     

        await insert_measurements(clients, collected_measurements, last_row);
        console.log(`Done inserting measurements.`);
      }
    });

  return new NextResponse("Hello World", { status: 200 });
}

const insert_order_fabrication_data = async (
  clients: pg.Client,
  {
    of_id,
    created_date,
    client,
    length_p,
    inner_diameter_p,
    outer_diameter_p,
    flat_crush_p,
    h20_p,
    length_ts,
    inner_diamter_ts,
    outer_diamter_ts,
    flat_crush_ts,
    h20_ts,
    length_ti,
    inner_diamter_ti,
    outer_diameter_ti,
    flat_crush_ti,
    h20_ti,
    date_control,
    time_control,
    length_m,
    inner_diamter_m,
    outer_diameter_m,
    flat_crush_m,
    h20_m,
    marking,
    circularity,
    straightness,
    conditioning,
    aspect,
    note,
    length_e,
    inner_diameter_e,
    outer_diameter_e,
    flat_crsuh_e,
    h20_e,
    length_min,
    inner_diameter_min,
    outer_diameter_min,
    flat_crush_min,
    h20_min,
    length_max,
    inner_diameter_max,
    outer_diameter_max,
    flat_crush_max,
    h20_max,
    length_avg,
    inner_diameter_avg,
    outer_diameter_avg,
    flat_crush_avg,
    h20_avg,
    length_et,
    inner_diameter_et,
    outer_diameter_et,
    flat_crush_et,
    h20_et,
    production_start_date,
    production_start_time,
    production_end_date,
    production_end_time,
    forwared_speed,
    oven_start_date,
    oven_start_time,
    oven_end_date,
    oven_end_time,
    steaming_temperature,
    number_of_steamed_pallets,
    controler,
    tube_quality,
  }: any
) => {
  const query = {
    text: "SELECT * FROM tbl_article where article_name=$1 and is_exist=true",
    values: [client],
  };

  const getCompanyName = {
    text: "select * from tbl_customer where company_name=$1 and is_exist=true",
    values: [client],
  };

  try {
    const { fields, rows } = await clients.query(query);

    const { fields: getCompanyFields, rows: getCompanyRows } =
      await clients.query(getCompanyName);
    let company_id
    if(getCompanyRows.length!=0){
     company_id = getCompanyRows[0].id;
    }else{
      company_id=null
    }
    let article_id 
    if(getCompanyRows.length!=0){
      article_id =  rows[0].id;
     }else{
       company_id=null
     }
    const pallete_count = 1;
    const created_at = created_date
      ? DateTime.fromISO("2000-01-01T00:00:00.000Z").toISO()
      : DateTime.fromFormat(created_date + "12:00 AM ", "dd/MM/yyyy HH:mm", {
          zone: "UTC",
        }).toISO();
    const product_name = "";
    const order_fabrication_control = of_id;
    const entry_date_time =
      production_start_date == ""
        ? DateTime.fromISO("2000-01-01T00:00:00.000Z").toISO()
        : DateTime.fromFormat(
            production_start_date + " " + production_start_time,
            "dd/MM/yyyy HH:mm",
            { zone: "UTC" }
          ).toISO();
    const exit_date_time =
      production_end_time == ""
        ? DateTime.fromISO("2000-01-01T00:00:00.000Z").toISO()
        : DateTime.fromFormat(
            production_end_date + " " + production_end_time,
            "dd/MM/yyyy HH:mm",
            { zone: "UTC" }
          ).toISO();

    const insertData = {
      text: "INSERT INTO public.tbl_orders_form(customer_id, article_id,  pallete_count, created_at,  product_name, order_fabrication_control, entry_date_time, exit_date_time) VALUES ($1 , $2, $3, $4, $5, $6, $7, $8) RETURNING id;",
      values: [
        company_id,
        article_id,
        pallete_count,
        created_at,
        product_name,
        order_fabrication_control,
        entry_date_time,
        exit_date_time,
      ],
    };
  
    const { rows: insertDataRow } = await clients.query(insertData);

    const OF_LAST_ID = insertDataRow[0].id;
    return OF_LAST_ID;
  } catch (e) {
    console.log(e);
    console.log(`Error something went wrong : ${e} . Returning false ${of_id}`);
    process.exit
    return false;
  }
};

const collect_measurement = (
  clients: pg.Client,
  controler_id: Text,
  {
    of_id,
    created_date,
    client,
    length_p,
    inner_diameter_p,
    outer_diameter_p,
    flat_crush_p,
    h20_p,
    length_ts,
    inner_diamter_ts,
    outer_diamter_ts,
    flat_crush_ts,
    h20_ts,
    length_ti,
    inner_diamter_ti,
    outer_diameter_ti,
    flat_crush_ti,
    h20_ti,
    date_control,
    time_control,
    length_m,
    inner_diamter_m,
    outer_diameter_m,
    flat_crush_m,
    h20_m,
    marking,
    circularity,
    straightness,
    conditioning,
    aspect,
    note,
    length_e,
    inner_diameter_e,
    outer_diameter_e,
    flat_crsuh_e,
    h20_e,
    length_min,
    inner_diameter_min,
    outer_diameter_min,
    flat_crush_min,
    h20_min,
    length_max,
    inner_diameter_max,
    outer_diameter_max,
    flat_crush_max,
    h20_max,
    length_avg,
    inner_diameter_avg,
    outer_diameter_avg,
    flat_crush_avg,
    h20_avg,
    length_et,
    inner_diameter_et,
    outer_diameter_et,
    flat_crush_et,
    h20_et,
    production_start_date,
    production_start_time,
    production_end_date,
    production_end_time,
    forwared_speed,
    oven_start_date,
    oven_start_time,
    oven_end_date,
    oven_end_time,
    steaming_temperature,
    number_of_steamed_pallets,
    controler,
    tube_quality,
  }: any
) => {


  const collected = [];
  collected.push({
    length: length_e,
    inner_diameter: inner_diameter_e,
    outer_diameter: outer_diameter_e,
    flat_crush: flat_crsuh_e,
    h20: h20_e,
    radial: null,
    remarks: note,
    user_id: controler_id,
  });
  collected.push({
    length: length_et,
    inner_diameter: inner_diameter_et,
    outer_diameter: outer_diameter_et,
    flat_crush: flat_crush_et,
    h20: h20_et,
    radial: null,
    remarks: note,
    user_id: controler_id,
  });
  collected.push({
    length: length_p,
    inner_diameter: inner_diameter_p,
    outer_diameter: outer_diameter_p,
    flat_crush: flat_crush_p,
    h20: h20_p,
    radial: null,
    remarks: note,
    user_id: controler_id,
  });
  collected.push({
    length: length_ti,
    inner_diameter: inner_diamter_ti,
    outer_diameter: outer_diameter_ti,
    flat_crush: flat_crush_ti,
    h20: h20_ti,
    radial: null,
    remarks: note,
    user_id: controler_id,
  });
  collected.push({
    length: length_m,
    inner_diameter: inner_diamter_m,
    outer_diameter: outer_diameter_m,
    flat_crush: flat_crush_m,
    h20: h20_m,
    radial: null,
    remarks: note,
    user_id: controler_id,
  });
  collected.push({
    length: length_ts,
    inner_diameter: inner_diamter_ts,
    outer_diameter: outer_diamter_ts,
    flat_crush: flat_crush_ts,
    h20: h20_ts,
    radial: null,
    remarks: note,
    user_id: controler_id,
  });
  return collected;
};

const getControlerId = async (controler: Text, clients: pg.Client) => {
  const getControler = {
    text: "select * from tbl_users where identification_code=$1 and is_exist=true",
    values: [controler],
  };
  try {
    const { rows } = await clients.query(getControler);
   
    return rows[0].uuid;
  } catch (e) {
    console.log("No uuid found . Returning super admin UUID...");
    return "f9d7b875-bb99-4eb8-8ebe-9e436caa2abb";
  }
};

const insert_measurements = async (
  clients: pg.Client,
  measurements: any,
  last_row: Text
) => {
  measurements.forEach(async (data: any, index: number) => {
    const length = data.length == "" ? 0 : parseFloat(data.length);
    const inner_diameter =
      data.inner_diameter == "" ? 0 : parseFloat(data.inner_diameter);
    const outer_diameter =
      data.outer_diameter == "" ? 0 : parseFloat(data.outer_diameter);
    const flat_crush = data.flat_crush == "" ? 0 : parseFloat(data.flat_crush);
    const h20 = data.h20 == "" ? 0 : parseFloat(data.h20);

    const insertMeasurement = {
      text: "INSERT INTO public.tbl_measurement( order_form_id, length, inside_diameter, outside_diameter, flat_crush, h20, radial,  remarks, user_id )	VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id;",
      values: [
        last_row,
        length,
        inner_diameter,
        outer_diameter,
        flat_crush,
        h20,
        data.radial,
        data.remarks,
        data.user_id,
      ],
    };
    try {
      const { rows } = await clients.query(insertMeasurement);

      // console.log(
      //   `Measurement # ${index} for Fabrication Id: ${last_row} inserted successfully.${rows[0].id}`
      // );
    } catch (e) {
      console.log(e);
    return 0;
    }
  });
};
