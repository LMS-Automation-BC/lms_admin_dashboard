export  async function getEnrollments(userId:string){
    //get both archived and non archived
    const res = await fetch(`https://brookescollege.neolms.com/api/v3/users/${userId}/class_students?api_key=6984896035c60de3c3d5d9c23a7aa645675997e4aa9c3fb72e67&$include=class,progress&$filter={\"class_archived\":true}`);
     const data = await res.json();
     return data;
}
export  async function getAssignments(classId:string){
     //get assignments for each class   
     const res = await fetch(`https://brookescollege.neolms.com/api/v3//classes/${classId}/assignments?api_key=6984896035c60de3c3d5d9c23a7aa645675997e4aa9c3fb72e67&$include=class,progress`);
     const data = await res.json();
     return data;
}