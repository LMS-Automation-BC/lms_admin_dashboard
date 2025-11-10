type Organization ={
    role:string;
    name:string;
    address:string;
    email:string;
    phone:string;
    website:string
    id:number;
  };
type ProgramsMap ={
  [programName: string]: Course[];
}  
type Course ={
  id?: number;           // optional when inserting
  ProgramName?: string;
  ProgramStartDate?:string;
  Course_Code: string;
  Course_Name: string;
  Credits: number;Last_Attempt?:string;
}

