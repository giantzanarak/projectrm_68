import { useState } from "react";

export default function Index() {
    const [number,setnumber]=useState(0);
    return (
        <>
        <div> hello ohm </div>
        <div>number {number}</div>
        <button
        onClick={()=>
        {
            setnumber(number + 1);
        }}
        className="bg-green-500 p-4 rounded-xl"
        >
            Click Add</button>
        <div className="grid grid-col-12 gap-6">
            <div >Lorem ipsum dolor sit amet consectetur, adipisicing elit. Culpa, repellat!</div>
            <div>Porro voluptatibus vitae excepturi, quam nulla possimus obcaecati? Iure, odit?</div>
            <div>Repellat voluptatum non nemo fuga ad blanditiis temporibus. Sit, quibusdam?</div>
        </div>
        </>

    );
}