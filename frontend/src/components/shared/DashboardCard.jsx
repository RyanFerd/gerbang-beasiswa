import { TrendingUp, TrendingDown } from "lucide-react"
import {
  Label,
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
} from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card" // Sesuaikan path import UI Anda

import { ChartContainer } from "@/components/ui/chart" // Sesuaikan path import UI Anda

const DashboardCard = ({
  title,
  description,
  totalValue,
  subValue, // Nilai kecil di bawah (misal: kenaikan bulan lalu)
  footerText,
  chartData, // Array data [{ name: 'x', value: 100, fill: '#xxxx' }]
  chartConfig,
  isTrendUp = true // Boolean untuk menentukan ikon naik/turun
}) => {
  
  // Hitung sudut lingkaran berdasarkan persentase (jika perlu)
  // Total lingkaran 360 derajat.
  // Kita asumsikan chartData[0].value adalah nilai saat ini.
  // Ini opsional, bisa diatur statis 360 jika ingin lingkaran penuh.
  const endAngle = 360; 

  return (
    <Card className="flex flex-col border-t-4 border-blue-900 shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardHeader className="items-center pb-0 text-center">
        <CardTitle className="text-xl font-bold text-blue-900">{title}</CardTitle>
        <CardDescription className="text-slate-500">{description}</CardDescription>
      </CardHeader>
      
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square h-[200px]"
        >
          <RadialBarChart
            data={chartData}
            startAngle={0}
            endAngle={endAngle}
            innerRadius={80}
            outerRadius={110}
          >
            <PolarGrid
              gridType="circle"
              radialLines={false}
              stroke="none"
              className="first:fill-slate-100 last:fill-white"
              polarRadius={[86, 74]}
            />
            {/* Bar Grafik dengan cornerRadius agar halus */}
            <RadialBar dataKey="value" background cornerRadius={10} />
            
            <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-blue-900 text-4xl font-extrabold"
                        >
                          {totalValue}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-slate-500 text-sm"
                        >
                          Total
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </PolarRadiusAxis>
          </RadialBarChart>
        </ChartContainer>
      </CardContent>

      <CardFooter className="flex-col gap-2 text-sm pt-2">
        <div className="flex items-center gap-2 font-medium leading-none text-slate-700">
          {isTrendUp ? (
            <>
                Naik {subValue} <TrendingUp className="h-4 w-4 text-emerald-600" />
            </>
          ) : (
            <>
                Turun {subValue} <TrendingDown className="h-4 w-4 text-red-600" />
            </>
          )}
        </div>
        <div className="leading-none text-slate-400 text-xs text-center">
            {footerText}
        </div>
      </CardFooter>
    </Card>
  )
}

export default DashboardCard