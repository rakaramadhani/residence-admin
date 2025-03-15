"use client"

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

const data = [
  {
    name: "Jan",
    occupancy: 85,
    revenue: 12400,
  },
  {
    name: "Feb",
    occupancy: 83,
    revenue: 12100,
  },
  {
    name: "Mar",
    occupancy: 82,
    revenue: 11800,
  },
  {
    name: "Apr",
    occupancy: 84,
    revenue: 12200,
  },
  {
    name: "May",
    occupancy: 86,
    revenue: 12600,
  },
  {
    name: "Jun",
    occupancy: 87,
    revenue: 12900,
  },
]

export function Overview() {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
        <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
        <Tooltip />
        <Legend />
        <Bar yAxisId="left" dataKey="occupancy" fill="#8884d8" name="Occupancy %" />
        <Bar yAxisId="right" dataKey="revenue" fill="#82ca9d" name="Revenue ($)" />
      </BarChart>
    </ResponsiveContainer>
  )
}

