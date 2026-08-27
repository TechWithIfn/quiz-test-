import{j as e,B as a}from"./index-CmBaFdmY.js";import{r as d,L as m}from"./vendor-react-BpZRNxb9.js";import{C as u}from"./content-validator.service-Cn6_UG_1.js";import{N as c,d as h,j as f,C as p}from"./vendor-icons-a4ZzW9rS.js";const n=`{
  "id": "test-example",
  "slug": "example-test",
  "title": "Example Test",
  "shortDescription": "A short test description.",
  "category": { "id": "cat-example", "name": "Example", "slug": "example" },
  "tags": [],
  "difficulty": "beginner",
  "estimatedMinutes": 5,
  "questionCount": 1,
  "language": "general",
  "createdAt": "2026-01-01T00:00:00.000Z",
  "questions": [
    {
      "id": "q-example-1",
      "question": "Which option is correct?",
      "type": "single-choice",
      "options": [{ "id": "a", "text": "Correct" }, { "id": "b", "text": "Other" }],
      "correctAnswer": "a",
      "explanation": "This option is correct because it matches the question.",
      "difficulty": "beginner",
      "topic": "Basics",
      "tags": []
    }
  ]
}`,N=()=>{const[i,t]=d.useState(""),[s,l]=d.useState(null),o=()=>l(u.validateSerialized(i));return e.jsxs("div",{className:"mx-auto w-full max-w-5xl space-y-8 px-4 py-8 sm:px-6 lg:px-8",children:[e.jsxs("header",{className:"border-b border-surface-200 pb-6 dark:border-surface-800",children:[e.jsxs("div",{className:"mb-2 flex items-center gap-2 text-sm font-medium text-brand-600 dark:text-brand-400",children:[e.jsx(c,{className:"h-4 w-4"}),"Contributor tool"]}),e.jsx("h1",{className:"text-3xl font-extrabold tracking-tight text-surface-900 dark:text-surface-50",children:"Validate a Test"}),e.jsx("p",{className:"mt-2 max-w-2xl text-sm leading-relaxed text-surface-500",children:"Check a JSON test definition against the QuizFlow content schema before adding it to the repository. Nothing is uploaded."})]}),e.jsxs("section",{className:"grid gap-6 lg:grid-cols-[1.35fr_0.65fr]",children:[e.jsxs("div",{children:[e.jsx("label",{htmlFor:"test-json",className:"mb-2 block text-sm font-semibold text-surface-900 dark:text-surface-100",children:"Test JSON"}),e.jsx("textarea",{id:"test-json",value:i,onChange:r=>t(r.target.value),placeholder:n,spellCheck:!1,className:"min-h-[30rem] w-full resize-y rounded-xl border border-surface-300 bg-surface-950 p-4 font-mono text-xs leading-relaxed text-surface-100 placeholder:text-surface-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:border-surface-700"}),e.jsxs("div",{className:"mt-3 flex flex-wrap gap-2",children:[e.jsx(a,{variant:"primary",size:"md",onClick:o,leftIcon:e.jsx(c,{className:"h-4 w-4"}),children:"Validate JSON"}),e.jsx(a,{variant:"outline",size:"md",onClick:()=>t(n),children:"Load Example"}),e.jsx(a,{variant:"ghost",size:"md",onClick:()=>{t(""),l(null)},children:"Clear"})]})]}),e.jsxs("aside",{className:"rounded-xl border border-surface-200 bg-white p-5 dark:border-surface-800 dark:bg-surface-900",children:[e.jsx("h2",{className:"font-semibold text-surface-900 dark:text-surface-50",children:"Checks included"}),e.jsxs("ul",{className:"mt-3 space-y-2 text-sm leading-relaxed text-surface-600 dark:text-surface-300",children:[e.jsx("li",{children:"Unique IDs and URL-safe slugs"}),e.jsx("li",{children:"Required test metadata and categories"}),e.jsx("li",{children:"At least two options per question"}),e.jsx("li",{children:"Correct answer references"}),e.jsx("li",{children:"Explanations and topic coverage"})]}),e.jsx(m,{to:"/tests",className:"mt-6 inline-flex",children:e.jsx(a,{variant:"ghost",size:"sm",leftIcon:e.jsx(h,{className:"h-4 w-4"}),children:"Browse Tests"})})]})]}),s&&e.jsxs("section",{"aria-live":"polite",className:"space-y-4",children:[e.jsxs("div",{className:s.valid?"rounded-xl border border-emerald-200 bg-emerald-50 p-5 dark:border-emerald-900/60 dark:bg-emerald-950/30":"rounded-xl border border-rose-200 bg-rose-50 p-5 dark:border-rose-900/60 dark:bg-rose-950/30",children:[e.jsxs("div",{className:"flex items-center gap-2 font-semibold text-surface-900 dark:text-surface-50",children:[s.valid?e.jsx(f,{className:"h-5 w-5 text-emerald-600"}):e.jsx(p,{className:"h-5 w-5 text-rose-600"}),s.valid?"Submission is valid":"Submission needs changes"]}),e.jsxs("p",{className:"mt-1 text-sm text-surface-600 dark:text-surface-300",children:[s.totalTests," test(s), ",s.totalQuestions," question(s), ",s.errors.length," error(s), ",s.warnings.length," warning(s)."]})]}),[...s.errors,...s.warnings].map((r,x)=>e.jsxs("div",{className:"rounded-lg border border-surface-200 bg-white p-4 text-sm dark:border-surface-800 dark:bg-surface-900",children:[e.jsxs("div",{className:"font-semibold text-surface-900 dark:text-surface-100",children:[r.type==="error"?"Error":"Warning"," · ",r.field]}),e.jsx("p",{className:"mt-1 text-surface-600 dark:text-surface-300",children:r.message})]},`${r.field}-${x}`))]})]})};export{N as ValidateTestPage};
