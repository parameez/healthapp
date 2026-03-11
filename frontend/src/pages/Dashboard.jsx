import { useEffect, useState } from "react";
import API from "../services/api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer
} from "recharts";

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [gripData, setGripData] = useState([]);

  useEffect(() => {
    const load = async () => {
      const res1 = await API.get("/dashboard/summary");
      setSummary(res1.data);

      const res2 = await API.get("/dashboard/grip-history");
      setGripData(res2.data);
    };

    load();
  }, []);

  if (!summary) return <div>Loading...</div>;

  return (
    <div style={{ padding: 24 }}>
      <h2>Dashboard</h2>

      <h3>Grip ล่าสุด</h3>
      {summary.latestGrip ? (
        <p>
          {summary.latestGrip.grip_value} kg ({summary.latestGrip.hand})
        </p>
      ) : (
        <p>ไม่มีข้อมูล</p>
      )}

      <h3>ค่าเฉลี่ย Grip</h3>
      <p>{Number(summary.avgGrip).toFixed(2)} kg</p>

      <h3>แนวโน้ม Grip</h3>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={gripData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="measured_at"
            tickFormatter={(date) =>
              new Date(date).toLocaleDateString()
            }
          />
          <YAxis />
          <Tooltip
            labelFormatter={(date) =>
              new Date(date).toLocaleString()
            }
          />
          <Line
            type="monotone"
            dataKey="grip_value"
            stroke="#8884d8"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
