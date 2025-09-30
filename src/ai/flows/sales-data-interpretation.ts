'use server';

/**
 * @fileOverview Provides sales data interpretation using a language model.
 *
 * - interpretSalesData - A function that interprets sales data and provides insights.
 * - InterpretSalesDataInput - The input type for the interpretSalesData function.
 * - InterpretSalesDataOutput - The return type for the interpretSalesData function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const InterpretSalesDataInputSchema = z.object({
  salesData: z.string().describe('The sales data to interpret, in JSON format.'),
  query: z.string().describe('The question about the sales data.'),
});
export type InterpretSalesDataInput = z.infer<typeof InterpretSalesDataInputSchema>;

const InterpretSalesDataOutputSchema = z.object({
  insight: z.string().describe('The insight generated from the sales data.'),
});
export type InterpretSalesDataOutput = z.infer<typeof InterpretSalesDataOutputSchema>;

export async function interpretSalesData(input: InterpretSalesDataInput): Promise<InterpretSalesDataOutput> {
  return interpretSalesDataFlow(input);
}

const prompt = ai.definePrompt({
  name: 'interpretSalesDataPrompt',
  input: {schema: InterpretSalesDataInputSchema},
  output: {schema: InterpretSalesDataOutputSchema},
  prompt: `You are an expert sales data analyst. Analyze the provided sales data and answer the question.\n\nSales Data: {{{salesData}}}\n\nQuestion: {{{query}}}\n\nInsight: `,
});

const interpretSalesDataFlow = ai.defineFlow(
  {
    name: 'interpretSalesDataFlow',
    inputSchema: InterpretSalesDataInputSchema,
    outputSchema: InterpretSalesDataOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
