'use client';
import { useSiteContent } from '@/components/storefront/SiteContentProvider';
import { ManagedSection } from '@/components/storefront/ManagedSections';
import type { CmsPageContent, SiteContent, RoutineContent } from '@/lib/cms/storefront-types';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Check, Coffee, CookingPot, Layers3, Leaf, Sprout, Sunrise } from 'lucide-react';
import { ProductCard } from '@/components/product/ProductCard';
import { hasAvailablePack, isKit, type CatalogItem } from '@/lib/catalog';



export function RoutineFinder({ catalog }: { catalog: CatalogItem[] }) {
  const cms = useSiteContent<RoutineContent>('routine'); const { copy, links, images } = cms;
 const iconMap:Record<string,typeof Leaf> = {sprout:Sprout,coffee:Coffee,layers:Layers3,sunrise:Sunrise,cooking:CookingPot,leaf:Leaf};
 const questions=cms.questions.map(q=>({...q,options:q.options.map(o=>({...o,icon:iconMap[o.icon] || Leaf}))}));

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const questionStructure=cms.questions.map(question=>question.id+':'+question.options.map(option=>option.value).join(',')).join('|');
  useEffect(()=>{setAnswers([]);setStep(0);},[questionStructure]);
  const heading = useRef<HTMLHeadingElement>(null);
  const initialized = useRef(false);
  useEffect(() => {
    if (initialized.current) heading.current?.focus({ preventScroll: true });
    initialized.current = true;
  }, [step]);
  const done = step >= questions.length;
 useEffect(()=>{ if(step > questions.length) setStep(questions.length); },[questions.length,step]);
  const answerFor=(id:string)=>answers[questions.findIndex(question=>question.id===id)];
 const type=cms.categoryRules[answerFor('category')];
 const candidates=catalog.filter(item=>type==='kit'?isKit(item):!isKit(item)&&item.product_type===type);
  const preferred = cms.recommendationRules[answerFor('moment')] || [];
  const score = (item: CatalogItem) => Number(hasAvailablePack(item)) * 10 + (preferred.includes(item.slug) ? preferred.length - preferred.indexOf(item.slug) : 0);
  const recommended = [...candidates].sort((a, b) => score(b) - score(a)).slice(0, Math.max(1,Math.min(6,cms.resultCounts[answerFor('quantity')]||1)));
  const reset = () => { setAnswers([]); setStep(0); };
  return <div className="routine-shell">
    <div className="store-container py-10 sm:py-16 lg:py-20">
      <header className="mx-auto max-w-2xl text-center">
        <span className="routine-eyebrow"><Leaf size={14} aria-hidden="true" />{copy.text_the_routine_finder}</span>
        <h1 className="mt-5 text-4xl leading-tight tracking-tight sm:text-5xl lg:text-6xl">{copy.text_a_little_ritual}<br />{copy.text_a_little_more_you}</h1>
        <p className="mx-auto mt-5 max-w-lg text-base leading-relaxed text-muted-gray sm:text-lg">{copy.text_three_simple_questions_a_few_pantry_favourites_chosen_a}</p>
      </header>
      {done ? <ManagedSection document="routine" sectionId="routinefinder_section_01"><section className="motion-panel mx-auto mt-10 max-w-5xl sm:mt-14" aria-labelledby="routine-result-heading">
        <div className="text-center">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-seedly-dark text-white"><Check size={23} aria-hidden="true" /></span>
          <h2 id="routine-result-heading" ref={heading} tabIndex={-1} className="mt-5 text-3xl outline-none sm:text-4xl">{copy.text_your_pantry_shortlist}</h2>
          <p className="mx-auto mt-3 max-w-lg leading-relaxed text-muted-gray">{copy.text_a_starting_point_for_your_everyday_ritual_explore_each}</p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">{answers.map((answer, index) => <span key={index} className="rounded-full border border-border-gray bg-white px-3 py-2 text-xs text-muted-gray">{questions[index].options.find(option => option.value === answer)?.label}</span>)}</div>
        </div>
        {recommended.length ? <div className={recommended.length === 1 ? 'mx-auto mt-10 max-w-sm' : 'mx-auto mt-10 grid max-w-4xl gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3'}>{recommended.map(item => <ProductCard key={item.id} product={item} />)}</div> : <div className="checkout-section mx-auto mt-8 max-w-lg text-center"><p>{copy.text_no_matching_products_are_available_right_now}</p><Link href={links.href_shop} className="text-link mt-3 inline-block">{copy.text_explore_the_pantry}</Link></div>}
        <div className="mt-10 flex flex-wrap justify-center gap-3"><button type="button" className="button-secondary" onClick={reset}>{copy.text_find_another_routine}</button><Link href={links.href_shop} className="button-primary">{copy.text_explore_all_products}<ArrowRight size={17} /></Link></div>
      </section></ManagedSection> : <ManagedSection document="routine" sectionId="routinefinder_section_02"><section className="routine-card mx-auto mt-10 max-w-4xl sm:mt-14" aria-labelledby="routine-question-heading">
        <ol className="routine-steps" aria-label="Routine finder progress">{questions.map((question, index) => <li key={question.step} aria-current={step === index ? 'step' : undefined} className={index <= step ? 'active' : ''}><span className="routine-step-number">{index < step ? <Check size={16} aria-label="Completed" /> : index + 1}</span><span>{question.step}</span></li>)}</ol>
        <div className="px-5 py-8 sm:px-10 sm:py-10">
          <div className="text-center"><p className="eyebrow">{copy.text_question}{step + 1} {copy.text_of}{questions.length}</p><h2 id="routine-question-heading" ref={heading} tabIndex={-1} className="mx-auto mt-3 max-w-xl text-2xl leading-snug outline-none sm:text-3xl">{questions[step].title}</h2><p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-muted-gray sm:text-base">{questions[step].description}</p></div>
          <fieldset key={step} className={'routine-options motion-panel mt-8 grid gap-3 sm:gap-4 ' + (questions[step].options.length === 2 ? 'mx-auto max-w-xl sm:grid-cols-2' : 'sm:grid-cols-3')}>
            <legend className="sr-only">{questions[step].title}</legend>
            {questions[step].options.map(option => <label key={option.value} className={'routine-option ' + (answers[step] === option.value ? 'selected' : '')}>
              <input type="radio" name="routine-answer" value={option.value} checked={answers[step] === option.value} className="sr-only" onChange={() => setAnswers(old => { const next = [...old]; next[step] = option.value; return next; })} />
              <span className="routine-option-check" aria-hidden="true">{answers[step] === option.value && <Check size={14} />}</span>
              {option.image ? <span className="routine-option-visual relative block aspect-[4/3] w-full overflow-hidden rounded-xl"><Image src={option.image} alt="" fill sizes="(max-width:639px) 80vw, 250px" className="object-cover" /></span> : <span className="routine-option-visual mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-seedly-light text-seedly-dark"><option.icon size={26} strokeWidth={1.5} aria-hidden="true" /></span>}
              <span className="routine-option-title mt-4 block text-base font-medium text-ink">{option.label}</span><span className="routine-option-detail mt-2 block text-sm leading-relaxed text-muted-gray">{option.detail}</span>
            </label>)}
          </fieldset>
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-border-gray px-5 py-5 sm:px-10">
          <button type="button" className="inline-flex min-h-12 items-center gap-2 px-2 text-sm disabled:opacity-35" disabled={step === 0} onClick={() => setStep(old => old - 1)}><ArrowLeft size={16} />{copy.text_back}</button>
          <button type="button" className="button-primary min-w-40" disabled={!answers[step]} onClick={() => setStep(old => old + 1)}>{step === questions.length - 1 ? 'Find my favourites' : 'Continue'}<ArrowRight size={16} /></button>
        </div>
      </section></ManagedSection>}
      <p className="mx-auto mt-7 max-w-xl text-center text-xs leading-relaxed text-muted-gray">{copy.text_made_for_your_kitchen_preferences_this_is_a_food_guide}</p>
    </div>
  </div>;
}
