import { useEffect, useState } from "react";
import Papa from "papaparse";
import {
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "./components/ui/chart";

const groupByInterval = (data, interval) => {
    const groupedData = {};

    data.forEach((item) => {
        const timeInSeconds = parseFloat(item.Time.replace(",", ".")); // Troca vírgula por ponto para conversão correta
        const co2Emissions = parseFloat(
            item["CO2 emissions (estimated)"].replace(",", ".")
        ); // Troca vírgula por ponto

        const intervalKey = Math.floor(timeInSeconds / interval); // Calcula a chave do intervalo

        if (!groupedData[intervalKey]) {
            groupedData[intervalKey] = { totalCO2: 0, count: 0 };
        }

        // Acumula as emissões de CO2
        groupedData[intervalKey].totalCO2 += co2Emissions;
        groupedData[intervalKey].count += 1;
    });

    // Converte os dados agrupados para um formato adequado
    return Object.keys(groupedData).map((key) => ({
        interval: key * interval, // Tempo em segundos correspondente ao intervalo
        avgCO2: groupedData[key].totalCO2 / groupedData[key].count,
    }));
};

export default function App() {
    const [co2Data, setCo2Data] = useState<any>([]);

    const changeHandler = (event) => {
        Papa.parse(event.target.files[0], {
            download: true,
            header: true,
            skipEmptyLines: true,
            delimiter: ";",
            beforeFirstChunk: (chunk) => {
                const lines = chunk.split("\n");
                const filteredLines = lines.filter(
                    (line) => !line.startsWith("#")
                );
                return filteredLines.join("\n");
            },
            complete: (result) => {
                const processedData = groupByInterval(result.data, 10);
                // console.log(processedData);
                setCo2Data(processedData);
            },
            error: (error) => {
                console.error("Erro ao processar o CSV:", error);
            },
        });
    };
    const teste = Array.from({ length: 180000 }).map((item, index) => {
        return { avgCO2: index + 4, interval: index };
    });

    console.log(teste);
    return (
        <div>
            <input
                type="file"
                name="file"
                onChange={changeHandler}
                accept=".csv"
                style={{ display: "block", margin: "10px auto" }}
            />

            <ChartContainer
                config={{
                    avgCO2: {
                        label: "Average CO2 Emissions",
                        color: "hsl(var(--chart-1))",
                    },
                }}
                className="h-[400px] mx-auto pt-4"
            >
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={teste}>
                        <XAxis
                            dataKey="interval"
                            label={{
                                value: "avgCO2",
                                position: "insideBottomRight",
                                offset: 0,
                            }}
                        />
                        <YAxis
                            label={{
                                value: "interval",
                                angle: -90,
                                position: "insideLeft",
                            }}
                        />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line
                            type="monotone"
                            dataKey="avgCO2"
                            stroke="var(--color-avgCO2)"
                            strokeWidth={2}
                            dot={false}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </ChartContainer>
        </div>
    );
}
