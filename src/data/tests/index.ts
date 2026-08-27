import { RawTest } from '@/types/content'
import { pythonBasicsTest } from './python/pythonBasics'
import { pythonInterviewTest } from './python/pythonInterview'
import { pythonDataAnalysisTest } from './python/pythonDataAnalysis'
import { sqlBasicsTest } from './sql/sqlBasics'
import { sqlInterviewTest } from './sql/sqlInterview'
import { sqlGroupByTest, sqlSubqueriesTest } from './sql/sqlGroupBySubqueries'
import { dataAnalystTest } from './interview/dataAnalyst'
import { verbalAbilityTest, hrInterviewTest, codingInterviewTest } from './interview/interviewTests'
import { excelAdvancedTest } from './excel/excelAdvanced'
import { javascriptCoreTest } from './javascript/javascriptCore'
import { logicalReasoningTest } from './aptitude/logicalReasoning'
import { criticalThinkingTest } from './reasoning/criticalThinking'
import { javaFundamentalsTest } from './programming/javaTest'
import { htmlDeepTest } from './programming/htmlTest'
import { cssDeepTest } from './programming/cssTest'
import {
  cProgrammingTest,
  cppFundamentalsTest,
  englishGrammarTest,
  competitiveQuantitativeTest,
  generalKnowledgeTest,
  scienceFoundationsTest,
  mathematicsFoundationsTest,
  webDevelopmentTest,
  cybersecurityFoundationsTest,
  cloudDevOpsFoundationsTest,
} from './catalogExpansion'
import {
  STRATEGIC_EXPANDED_TESTS,
  pythonOopTest,
  pythonOutputTest,
  sqlWindowFunctionsTest,
  sqlJoinsTest,
  reactCoreTest,
  nodejsCoreTest,
  dataAnalystInterviewTest,
  quantitativeAptitudeTest,
} from './strategicCatalog'

/**
 * Version-controlled registry of all static test suites across domains.
 *
 * Domain clusters:
 * - Programming: Python (Basics, OOP, Output, Interview, Data Analysis), Java, C, C++, JavaScript, HTML, CSS
 * - Data & Analytics: SQL (Basics, Interview, GROUP BY, Subqueries, JOINs, Window Functions), Excel
 * - Web: HTML, CSS, JavaScript, React, Node.js, Web Development
 * - Interview Preparation: Data Analyst, Coding Interview, Verbal Ability, HR Interview, Quantitative Aptitude
 * - Competitive/Academic: General Knowledge, English Grammar, Mathematics, Science, Logical Reasoning
 */
export const ALL_RAW_TESTS: RawTest[] = [
  // === PYTHON CLUSTER ===
  pythonBasicsTest,
  pythonInterviewTest,
  pythonDataAnalysisTest,
  pythonOopTest,
  pythonOutputTest,

  // === SQL CLUSTER ===
  sqlBasicsTest,
  sqlInterviewTest,
  sqlGroupByTest,
  sqlSubqueriesTest,
  sqlWindowFunctionsTest,
  sqlJoinsTest,

  // === WEB DEVELOPMENT CLUSTER ===
  htmlDeepTest,
  cssDeepTest,
  javascriptCoreTest,
  reactCoreTest,
  nodejsCoreTest,
  webDevelopmentTest,

  // === PROGRAMMING LANGUAGES ===
  javaFundamentalsTest,
  cProgrammingTest,
  cppFundamentalsTest,

  // === DATA & ANALYTICS ===
  dataAnalystTest,
  dataAnalystInterviewTest,
  excelAdvancedTest,

  // === INTERVIEW PREPARATION ===
  codingInterviewTest,
  verbalAbilityTest,
  hrInterviewTest,
  quantitativeAptitudeTest,
  logicalReasoningTest,
  criticalThinkingTest,

  // === COMPETITIVE / ACADEMIC ===
  generalKnowledgeTest,
  englishGrammarTest,
  mathematicsFoundationsTest,
  scienceFoundationsTest,
  competitiveQuantitativeTest,

  // === OTHER / FOUNDATION ===
  cybersecurityFoundationsTest,
  cloudDevOpsFoundationsTest,

  // Spread any remaining strategic tests not already listed
  ...STRATEGIC_EXPANDED_TESTS.filter(
    (t) =>
      ![
        pythonOopTest.id,
        pythonOutputTest.id,
        sqlWindowFunctionsTest.id,
        sqlJoinsTest.id,
        reactCoreTest.id,
        nodejsCoreTest.id,
        dataAnalystInterviewTest.id,
        quantitativeAptitudeTest.id,
      ].includes(t.id)
  ),
]

export {
  pythonBasicsTest,
  pythonInterviewTest,
  pythonDataAnalysisTest,
  sqlBasicsTest,
  sqlInterviewTest,
  sqlGroupByTest,
  sqlSubqueriesTest,
  dataAnalystTest,
  excelAdvancedTest,
  javascriptCoreTest,
  logicalReasoningTest,
  criticalThinkingTest,
  javaFundamentalsTest,
  htmlDeepTest,
  cssDeepTest,
  verbalAbilityTest,
  hrInterviewTest,
  codingInterviewTest,
  cProgrammingTest,
  cppFundamentalsTest,
  englishGrammarTest,
  competitiveQuantitativeTest,
  generalKnowledgeTest,
  scienceFoundationsTest,
  mathematicsFoundationsTest,
  webDevelopmentTest,
  cybersecurityFoundationsTest,
  cloudDevOpsFoundationsTest,
  pythonOopTest,
  pythonOutputTest,
  sqlWindowFunctionsTest,
  sqlJoinsTest,
  reactCoreTest,
  nodejsCoreTest,
  dataAnalystInterviewTest,
  quantitativeAptitudeTest,
}
