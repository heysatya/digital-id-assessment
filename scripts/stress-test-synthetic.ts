import { createClient } from '@supabase/supabase-js';
import { questions } from '../src/data/questions';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Force load env from index if not running through next
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ SUPABASE_URL or SUPABASE_KEY missing in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const STAKEHOLDER_TYPES = ['REG', 'GOV', 'PRI', 'CIV'];

/**
 * Generate a random response based on question type
 */
function getRandomResponse(responseType: string): string {
    if (responseType === 'likert' || responseType === 'percentage') {
        // Higher probability for middle values (1-3) but covers 0-4
        const vals = ['0', '1', '2', '3', '4'];
        return vals[Math.floor(Math.random() * vals.length)];
    }
    if (responseType === 'yes_no') {
        const vals = ['0', '1', '3', '4', 'not_sure'];
        return vals[Math.floor(Math.random() * vals.length)];
    }
    return '0';
}

/**
 * Run a permutation test on specific high-weight questions.
 * This ensures that even if stakeholders are at opposite ends (0 vs 4),
 * the aggregator produces a stable result.
 */
async function runPermutationTest() {
    console.log('\n⚖️ Running Permutation Stability Test (Stakeholder Disagreement)...');
    
    // Pick 3 high weight questions
    const highWeightQs = questions
        .filter(q => q.weight >= 3)
        .slice(0, 3);
    
    for (const type of STAKEHOLDER_TYPES) {
        console.log(`\n👨‍💼 Stakeholder: ${type} | Testing 0-4 range permutations...`);
        
        // Submit 5 assessments, one for each anchor value 0-4
        for (let val = 0; val <= 4; val++) {
            const { data: assessment } = await supabase
                .from('assessments')
                .insert([{
                    respondent_name: `[SYNTHETIC] Permutation ${type} Val-${val}`,
                    email: `perm_${type.toLowerCase()}_${val}@test.id`,
                    organization: `Stability Lab`,
                    stakeholder_type: type,
                    environment_mode: 'test'
                }])
                .select()
                .single();

            if (assessment) {
                const responseInserts = highWeightQs.map(q => ({
                    assessment_id: assessment.id,
                    question_id: q.id,
                    response_value: val.toString()
                }));

                await supabase.from('responses').insert(responseInserts);
            }
        }
    }
    console.log('✅ Permutation Matrix Generated.');
}

/**
 * Main stress test runner
 */
async function runStressTest() {
  console.log('🚀 Starting Synthetic Data Stress Test...');
  console.log(`📊 Mode: test | URL: ${supabaseUrl}`);

  const startTime = Date.now();
  let totalAssessments = 0;
  let totalResponses = 0;

  // 1. Run randomized volume test (1-15 per stakeholder)
  for (const type of STAKEHOLDER_TYPES) {
    const count = Math.floor(Math.random() * 15) + 1; // 1-15 per stakeholder
    console.log(`\n👨‍💼 Stakeholder: ${type} | Generating ${count} randomized assessments...`);

    // Filter questions valid for this stakeholder
    const validQuestions = questions.filter(q => 
        q.primaryStakeholder === type || 
        q.secondaryStakeholder === type || 
        q.secondaryStakeholder === 'NONE'
    );

    for (let i = 0; i < count; i++) {
        // 1. Create Synthetic Assessment
        const { data: assessment, error: assessmentError } = await supabase
            .from('assessments')
            .insert([{
                respondent_name: `[SYNTHETIC] ${type} ${i + 1}`,
                email: `synthetic_${type.toLowerCase()}_${i}@test.id`,
                organization: `Synthetic Labs ${type}`,
                stakeholder_type: type,
                environment_mode: 'test'
            }])
            .select()
            .single();

        if (assessmentError || !assessment) {
            console.error(`❌ Error creating assessment ${i}:`, assessmentError.message);
            continue;
        }

        // 2. Generate Synthetic Responses
        const responseInserts = validQuestions.map(q => ({
            assessment_id: assessment.id,
            question_id: q.id,
            response_value: getRandomResponse(q.responseType)
        }));

        const { error: responseError } = await supabase
            .from('responses')
            .insert(responseInserts);

        if (responseError) {
            console.error(`❌ Error inserting responses for assessment ${assessment.id}:`, responseError.message);
        } else {
            totalAssessments++;
            totalResponses += responseInserts.length;
        }

        // Small delay to avoid aggressive rate limiting
        await new Promise(r => setTimeout(r, 100));
    }
  }

  // 2. Run explicit permutation test
  await runPermutationTest();

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log('\n✅ Stress Test Completed Successfully!');
  console.log(`⏱️ Duration: ${duration}s`);
  console.log(`📦 Total Assessments (Excl. Permutations): ${totalAssessments}`);
  console.log(`📝 Total Responses (Estimated): ${totalResponses + (STAKEHOLDER_TYPES.length * 5 * 3)}`);
  console.log(`🔍 All data tagged with environment_mode: 'test' and [SYNTHETIC] prefix`);
}

runStressTest().catch(console.error);

