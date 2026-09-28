'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Compass,
  Check,
  RotateCcw,
  Plus,
  Moon,
  Leaf,
  Sparkles,
  Sun,
  Coffee,
  Utensils,
  Package,
  Sprout,
  Edit2,
  ShieldCheck,
} from 'lucide-react';
import { useCart } from '../../../lib/store/cart';
import { formatPKR } from '../../../lib/utils';

interface QuestionOption {
  value: string;
  label: string;
  description: string;
  iconName: 'moon' | 'leaf' | 'sparkles' | 'sun' | 'utensils' | 'coffee' | 'package' | 'sprout';
}

interface Question {
  id: string;
  title: string;
  subtitle: string;
  options: QuestionOption[];
}

const questions: Question[] = [
  {
    id: 'goal',
    title: 'What is your primary wellness focus right now?',
    subtitle: 'Select the area of daily health your body is asking for most.',
    options: [
      {
        value: 'cycle_hormones',
        label: 'Cycle & Hormonal Harmony',
        description: 'Gentle menstrual rhythm, PMS ease, and balanced dietary fatty acids.',
        iconName: 'moon',
      },
      {
        value: 'digestion_bloat',
        label: 'Digestive Ease & Lightness',
        description: 'Post-meal lightness, easing bloating, and soluble dietary fiber motility.',
        iconName: 'leaf',
      },
      {
        value: 'sleep_calm',
        label: 'Restful Sleep & Evening Calm',
        description: 'Unwinding mental fatigue and soothing nervous tension before bedtime.',
        iconName: 'sparkles',
      },
      {
        value: 'energy_vitality',
        label: 'Natural Energy & Glow',
        description: 'Plant-based vitamin E, minerals, and healthy fats for daily vitality.',
        iconName: 'sun',
      },
    ],
  },
  {
    id: 'ritual',
    title: 'How do you prefer to take your botanicals?',
    subtitle: 'The best routine is the one that naturally fits into your daily routine.',
    options: [
      {
        value: 'spoonful_smoothie',
        label: 'Sprinkled in Food & Smoothies',
        description: 'Stirred into morning yogurt bowls, oatmeal, shakes, or salads.',
        iconName: 'utensils',
      },
      {
        value: 'warm_tea',
        label: 'Sipping a Warm Steeped Infusion',
        description: 'A comforting cup of pure whole blossom or loose leaf mountain tea.',
        iconName: 'coffee',
      },
      {
        value: 'complete_ritual',
        label: 'Structured Monthly Routine Box',
        description: 'A complete guided kit with calendar and dedicated wooden measuring scoop.',
        iconName: 'package',
      },
    ],
  },
  {
    id: 'experience',
    title: 'Have you practiced seed cycling or botanical infusions before?',
    subtitle: 'This helps us tailor the most approachable starting recommendation.',
    options: [
      {
        value: 'beginner',
        label: 'I am completely new',
        description: 'Keep it simple with clear daily instructions and zero guesswork.',
        iconName: 'sprout',
      },
      {
        value: 'intermediate',
        label: 'I know the basics',
        description: 'I already incorporate edible seeds or herbal teas occasionally.',
        iconName: 'leaf',
      },
      {
        value: 'daily_practitioner',
        label: 'I have an established routine',
        description: 'Looking for verified unbleached single-origin Pakistani harvests.',
        iconName: 'sparkles',
      },
    ],
  },
];

function renderOptionIcon(name: string) {
  const props = { className: 'w-6 h-6 text-seedly-primary' };
  switch (name) {
    case 'moon':
      return <Moon {...props} />;
    case 'leaf':
      return <Leaf {...props} />;
    case 'sparkles':
      return <Sparkles {...props} />;
    case 'sun':
      return <Sun {...props} />;
    case 'utensils':
      return <Utensils {...props} />;
    case 'coffee':
      return <Coffee {...props} />;
    case 'package':
      return <Package {...props} />;
    case 'sprout':
    default:
      return <Sprout {...props} />;
  }
}

interface RecommendedItem {
  id: string;
  name: string;
  slug: string;
  type: 'kits' | 'teas' | 'seeds';
  price: number;
  badge: string;
  image: string;
  reason: string;
  isPairing?: boolean;
}

export default function FindYourSeedPage() {
  const { addItem } = useCart();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [completed, setCompleted] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [addedStatus, setAddedStatus] = useState(false);

  const handleSelectOption = (value: string) => {
    const q = questions[currentStep];
    const newAnswers = { ...answers, [q.id]: value };
    setAnswers(newAnswers);

    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setCompleted(true);
      // Initialize selected items for recommendations
      const rec = computeRecommendations(newAnswers);
      setSelectedIds(rec.products.map((p) => p.id));
    }
  };

  const handleReset = () => {
    setAnswers({});
    setCurrentStep(0);
    setCompleted(false);
    setSelectedIds([]);
    setAddedStatus(false);
  };

  const handleEditAnswers = () => {
    setCompleted(false);
    setCurrentStep(0);
  };

  const toggleProductSelection = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Rule-based recommendation engine matching user format and goal
  function computeRecommendations(ans: Record<string, string>): {
    title: string;
    explanation: string;
    products: RecommendedItem[];
  } {
    const goal = ans.goal || 'cycle_hormones';
    const ritual = ans.ritual || 'complete_ritual';

    let formatReason = 'Based on your health focus, here is our recommended routine:';
    if (ritual === 'warm_tea') {
      formatReason = 'You prefer warm infusions, so we paired this routine with high-mountain botanical tea.';
    } else if (ritual === 'spoonful_smoothie') {
      formatReason = 'You prefer sprinkling botanicals into daily meals, so whole unroasted seeds lead your routine.';
    } else if (ritual === 'complete_ritual') {
      formatReason = 'You prefer a structured routine, so our complete month-long box set with measuring scoop is your ideal match.';
    }

    if (goal === 'cycle_hormones') {
      return {
        title: 'Suggested Products: Cycle & Hormonal Routine',
        explanation: `${formatReason} Seed cycling with raw Pumpkin, Flax, Sunflower, and Sesame seeds synchronizes essential fatty acids with your natural follicular and luteal phases.`,
        products: [
          {
            id: 'kit-complete',
            name: 'Complete 28-Day Seed Cycling Ritual Kit',
            slug: 'complete-cycle-kit',
            type: 'kits',
            price: 285000,
            badge: 'PRIMARY RECOMMENDATION',
            image: '/images/products/complete-kit.svg',
            reason: 'All 4 heirloom seeds portioned for both phases with handcrafted wooden scoop and tracking guide.',
            isPairing: false,
          },
          {
            id: 'prod-spearmint',
            name: 'Organic Gilgit Spearmint Leaf Tea',
            slug: 'spearmint-tea',
            type: 'teas',
            price: 115000,
            badge: 'RECOMMENDED PAIRING',
            image: '/images/products/spearmint-tea.svg',
            reason: 'Naturally soothes androgenic fluctuations and post-meal digestive bloating.',
            isPairing: true,
          },
        ],
      };
    }

    if (goal === 'sleep_calm') {
      const isTeaFirst = ritual === 'warm_tea';
      const teaItem: RecommendedItem = {
        id: 'prod-chamomile',
        name: 'Pure Whole Flower Chamomile Tea',
        slug: 'chamomile-tea',
        type: 'teas',
        price: 125000,
        badge: isTeaFirst ? 'PRIMARY RECOMMENDATION' : 'RECOMMENDED PAIRING',
        image: '/images/products/chamomile-tea.svg',
        reason: 'Hand-picked whole blossoms from Gilgit with natural soothing honey notes.',
        isPairing: !isTeaFirst,
      };

      const seedItem: RecommendedItem = {
        id: 'prod-pumpkin',
        name: 'Raw Heirloom Pumpkin Seeds',
        slug: 'pumpkin-seeds',
        type: 'seeds',
        price: 95000,
        badge: isTeaFirst ? 'RECOMMENDED PAIRING' : 'PRIMARY RECOMMENDATION',
        image: '/images/products/pumpkin-seeds.svg',
        reason: 'Natural source of tryptophan and elemental magnesium to support evening relaxation.',
        isPairing: isTeaFirst,
      };

      return {
        title: 'Suggested Products: Rest & Evening Routine',
        explanation: `${formatReason} Bioavailable food magnesium from raw pumpkin seeds paired with calming whole chamomile blossoms gently primes nighttime relaxation.`,
        products: isTeaFirst ? [teaItem, seedItem] : [seedItem, teaItem],
      };
    }

    if (goal === 'digestion_bloat') {
      return {
        title: 'Suggested Products: Daily Digestive Routine',
        explanation: `${formatReason} Rich soluble dietary mucilage from cold-milled golden flax combines naturally with mountain spearmint leaves to ease gastrointestinal tension and encourage daily regularity.`,
        products: [
          {
            id: 'prod-flax',
            name: 'Cold-Milled Golden Flax Seeds',
            slug: 'flax-seeds',
            type: 'seeds',
            price: 68000,
            badge: 'PRIMARY RECOMMENDATION',
            image: '/images/products/flax-seeds.svg',
            reason: 'High soluble prebiotic fiber matrix that supports a healthy gut microbiome.',
            isPairing: false,
          },
          {
            id: 'prod-spearmint',
            name: 'Organic Gilgit Spearmint Leaf Tea',
            slug: 'spearmint-tea',
            type: 'teas',
            price: 115000,
            badge: 'RECOMMENDED PAIRING',
            image: '/images/products/spearmint-tea.svg',
            reason: 'Crisp mountain spearmint to relax intestinal muscles and reduce post-meal bloating.',
            isPairing: true,
          },
        ],
      };
    }

    // Default: energy_vitality
    return {
      title: 'Suggested Products: Morning Vitality Routine',
      explanation: `${formatReason} A natural nutrient pairing of Vitamin E-rich sunflower kernels and fresh spring-harvest green tea provides clean, jitter-free energy and cellular nourishment.`,
      products: [
        {
          id: 'prod-sunflower',
          name: 'Organic Raw Sunflower Kernels',
          slug: 'sunflower-seeds',
          type: 'seeds',
          price: 72000,
          badge: 'PRIMARY RECOMMENDATION',
          image: '/images/products/sunflower-seeds.svg',
          reason: 'Concentrated natural d-alpha tocopherol and selenium for cell membrane health.',
          isPairing: false,
        },
        {
          id: 'prod-green-tea',
          name: 'Highland Whole Leaf Green Tea',
          slug: 'green-tea',
          type: 'teas',
          price: 135000,
          badge: 'RECOMMENDED PAIRING',
          image: '/images/products/green-tea.svg',
          reason: 'EGCG catechins and natural L-theanine for sustained calm morning alertness.',
          isPairing: true,
        },
      ],
    };
  }

  const recommendations = computeRecommendations(answers);

  const handleAddSelectedToCart = () => {
    const toAdd = recommendations.products.filter((p) => selectedIds.includes(p.id));
    if (toAdd.length === 0) return;

    for (const p of toAdd) {
      addItem({
        id: `${p.id}-quiz`,
        product_id: p.id,
        kit_id: p.type === 'kits' ? p.id : undefined,
        name: p.name,
        slug: p.slug,
        price_minor: p.price,
        image_url: p.image,
        quantity: 1,
        product_type: p.type === 'kits' ? 'kit' : p.type === 'teas' ? 'tea' : 'seed',
      });
    }
    setAddedStatus(true);
    setTimeout(() => setAddedStatus(false), 2000);
  };

  const handleAddPrimaryOnly = () => {
    const primary = recommendations.products[0];
    if (!primary) return;

    addItem({
      id: `${primary.id}-quiz`,
      product_id: primary.id,
      kit_id: primary.type === 'kits' ? primary.id : undefined,
      name: primary.name,
      slug: primary.slug,
      price_minor: primary.price,
      image_url: primary.image,
      quantity: 1,
      product_type: primary.type === 'kits' ? 'kit' : primary.type === 'teas' ? 'tea' : 'seed',
    });
    setAddedStatus(true);
    setTimeout(() => setAddedStatus(false), 2000);
  };

  const currentQ = questions[currentStep];
  // Calculate completed answer progress accurately:
  // Step 1: 0 answers complete (0%)
  // Step 2: 1 answer complete (33%)
  // Step 3: 2 answers complete (67%)
  // Results: 3 answers complete (100%)
  const completedAnswersCount = Object.keys(answers).length;
  const progressPercent = Math.round((completedAnswersCount / questions.length) * 100);

  const selectedProducts = recommendations.products.filter((p) => selectedIds.includes(p.id));
  const selectedTotalMinor = selectedProducts.reduce((sum, p) => sum + p.price, 0);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto mb-10 space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-seedly-light text-seedly-dark text-xs font-semibold uppercase tracking-wider">
          <Compass className="w-3.5 h-3.5 text-seedly-primary" />
          <span>Botanical Product Finder</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-charcoal">
          Find Your Seed &amp; Tea Ritual
        </h1>
        <p className="text-sm text-muted-gray">
          A 2-minute guide to match Pakistan's purest edible heirloom botanicals to your routine.
        </p>
      </div>

      {!completed ? (
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-border-gray shadow-card animate-fadeIn">
          {/* Progress Indicator */}
          <div className="mb-8 space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-gray font-medium">
              <span>
                Question {currentStep + 1} of {questions.length}
              </span>
              <span>{progressPercent}% Complete</span>
            </div>
            <div className="w-full bg-cream h-2 rounded-full overflow-hidden border border-border-gray/50">
              <div
                className="bg-seedly-primary h-full transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Current Question */}
          <div className="space-y-2 mb-8">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal">
              {currentQ.title}
            </h2>
            <p className="text-sm text-muted-gray">{currentQ.subtitle}</p>
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {currentQ.options.map((opt) => {
              const selected = answers[currentQ.id] === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSelectOption(opt.value)}
                  className={`p-5 rounded-2xl border text-left transition-all flex flex-col justify-between hover:shadow-hover ${
                    selected
                      ? 'border-seedly-dark bg-seedly-light/60 shadow-subtle'
                      : 'border-border-gray bg-cream/30 hover:border-seedly-primary hover:bg-cream'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-white border border-border-gray/80 flex items-center justify-center shadow-subtle">
                      {renderOptionIcon(opt.iconName)}
                    </div>
                    <h3 className="font-serif font-bold text-base text-charcoal">{opt.label}</h3>
                    <p className="text-xs text-muted-gray leading-relaxed">{opt.description}</p>
                  </div>
                  <div className="pt-4 flex items-center justify-end">
                    <div
                      className={`w-6 h-6 rounded-full border flex items-center justify-center transition-colors ${
                        selected
                          ? 'border-seedly-dark bg-seedly-dark text-white'
                          : 'border-border-gray bg-white'
                      }`}
                    >
                      {selected && <Check className="w-3.5 h-3.5" />}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Step Back button */}
          {currentStep > 0 && (
            <div className="mt-8 pt-4 border-t border-border-gray/50 flex justify-start">
              <button
                type="button"
                onClick={() => setCurrentStep(currentStep - 1)}
                className="text-xs font-semibold text-muted-gray hover:text-charcoal"
              >
                ← Back to previous question
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Results View */
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-border-gray shadow-card animate-fadeIn space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-3">
            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold uppercase tracking-wider">
              Recommendation Ready
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal">
              {recommendations.title}
            </h2>
            <p className="text-sm text-muted-gray leading-relaxed">
              {recommendations.explanation}
            </p>
          </div>

          {/* Recommended Products with Explicit Inclusion Checkboxes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {recommendations.products.map((prod) => {
              const isSelected = selectedIds.includes(prod.id);
              return (
                <div
                  key={prod.id}
                  onClick={() => toggleProductSelection(prod.id)}
                  className={`rounded-2xl border p-5 flex flex-col justify-between space-y-4 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-seedly-dark bg-seedly-light/20 shadow-subtle'
                      : 'border-border-gray bg-cream/20 opacity-75'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="relative aspect-video rounded-xl overflow-hidden bg-stone/40 border border-border-gray/50 flex items-center justify-center">
                      <Image src={prod.image} alt={prod.name} fill className="object-contain p-3" />
                      <span
                        className={`absolute top-2 left-2 px-2 py-0.5 text-[10px] font-bold rounded-full ${
                          prod.isPairing
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : 'bg-seedly-dark text-white'
                        }`}
                      >
                        {prod.badge}
                      </span>
                    </div>

                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-serif font-bold text-base text-charcoal">{prod.name}</h3>
                        <p className="text-xs text-muted-gray mt-1 leading-relaxed">{prod.reason}</p>
                      </div>
                      <div
                        className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 mt-1 transition-colors ${
                          isSelected
                            ? 'bg-seedly-dark border-seedly-dark text-white'
                            : 'border-border-gray bg-white'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-border-gray/60 flex items-center justify-between">
                    <div>
                      <span className="font-serif font-bold text-base text-charcoal">
                        {formatPKR(prod.price)}
                      </span>
                      {prod.isPairing && (
                        <span className="block text-[10px] text-muted-gray">Optional Pairing</span>
                      )}
                    </div>
                    <Link
                      href={`/${prod.type}/${prod.slug}`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-xs font-semibold text-seedly-dark hover:underline"
                    >
                      View Details →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pricing Summary Breakdown */}
          <div className="p-4 bg-cream rounded-2xl border border-border-gray flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="space-y-0.5 text-center sm:text-left">
              <span className="text-muted-gray">Selected Items ({selectedProducts.length} of {recommendations.products.length}):</span>
              <p className="font-semibold text-charcoal">
                {selectedProducts.map((p) => p.name).join(' + ') || 'None selected'}
              </p>
            </div>
            <div className="text-right">
              <span className="text-muted-gray block text-[11px]">Combined Total</span>
              <strong className="font-serif text-lg font-bold text-seedly-dark">
                {formatPKR(selectedTotalMinor)}
              </strong>
            </div>
          </div>

          {/* Actions: Edit, Retake, and Add buttons */}
          <div className="pt-4 border-t border-border-gray flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={handleEditAnswers}
                className="text-xs font-semibold text-muted-gray hover:text-charcoal flex items-center gap-1.5"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit Choices</span>
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="text-xs font-semibold text-muted-gray hover:text-charcoal flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Start Over</span>
              </button>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto">
              {recommendations.products.length > 1 && selectedIds.length === 2 && (
                <button
                  type="button"
                  onClick={handleAddPrimaryOnly}
                  className="w-full sm:w-auto px-5 py-3 rounded-full text-xs font-semibold border border-border-gray hover:bg-cream text-charcoal transition-all"
                >
                  Add Primary Kit Only ({formatPKR(recommendations.products[0].price)})
                </button>
              )}

              <button
                type="button"
                disabled={selectedIds.length === 0}
                onClick={handleAddSelectedToCart}
                className={`w-full sm:w-auto px-7 py-3.5 rounded-full font-medium text-xs sm:text-sm transition-all shadow-card flex items-center justify-center gap-2 ${
                  selectedIds.length === 0
                    ? 'bg-stone text-muted-gray cursor-not-allowed'
                    : addedStatus
                    ? 'bg-emerald-700 text-white'
                    : 'bg-seedly-dark hover:bg-seedly-forest text-white'
                }`}
              >
                {addedStatus ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Added to Basket!</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>
                      {selectedIds.length === 0
                        ? 'Select an Item'
                        : `Add Selected Items (${formatPKR(selectedTotalMinor)})`}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Wholesome nutrition notice */}
          <div className="pt-2 text-center">
            <p className="text-[11px] text-muted-gray flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-seedly-primary" />
              <span>Wholesome culinary botanicals. Delivered nationwide across Pakistan via TCS &amp; Leopards.</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
