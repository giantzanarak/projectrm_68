import { useState } from "react";
import { Link } from "react-router-dom";

export default function Dashboard() {
    const [number, setnumber] = useState(0);
    return (
        <>
            <div> hello ohm </div>
            <table>
                <th>Ohm</th>
                <tr>
                    <td> apipath </td>
                </tr>
            </table>
            <Link to="/ohmeiei">to Ohm</Link>
        </>

    );
}