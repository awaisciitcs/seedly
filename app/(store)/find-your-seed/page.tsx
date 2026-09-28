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
    title: 'What brings you to Seedly today?',
    subtitle: 'Select what you would most like to support in your daily routine.',
    options: [
      {
        value: 'cycle_hormones',
        label: 'Cycle & Monthly Balance',
        description: 'Gentle support for your natural monthly rhythm, easing bloating, and everyday calm.',
        iconName: 'moon',
      },
      {
        value: 'digestion_bloat',
        label: 'Digestive Comfort & Lightness',
        description: 'Feeling lighter after meals, easing sluggishness, and gentle daily dietary fiber.',
        iconName: 'leaf',
      },
      {
        value: 'sleep_calm',
        label: 'Evening Calm & Better Sleep',
        description: 'Unwinding after a busy day with a soothing, caffeine-free bedtime ritual.',
        iconName: 'sparkles',
      },
      {
        value: 'energy_vitality',
        label: 'Daily Energy & Natural Glow',
        description: 'Nutrient-dense seeds packed with plant protein, minerals, and natural Vitamin E.',
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
      // Initialize with ONLY the primary recommended item selected (optional pairing left unchecked by default)
      const rec = computeRecommendations(newAnswers);
      setSelectedIds(rec.products.length > 0 ? [rec.products[0].id] : []);
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

    if (goal === 'cycle_hormones') {
      const isTeaFirst = ritual === 'warm_tea';

      const seedKitItem: RecommendedItem = {
        id: 'kit-complete',
        name: 'Complete 28-Day Seed Cycling Ritual Kit',
        slug: 'complete-cycle-kit',
        type: 'kits',
        price: 285000,
        badge: isTeaFirst ? 'OPTIONAL PAIRING' : 'PRIMARY ROUTINE',
        image: '/images/products/complete-kit.jpg',
        reason: 'All 4 raw heirloom seeds portioned for both monthly phases, with handcrafted wooden scoop and tracking calendar.',
        isPairing: isTeaFirst,
      };

      const spearmintItem: RecommendedItem = {
        id: 'prod-spearmint',
        name: 'Organic Gilgit Spearmint Leaf Tea',
        slug: 'spearmint-tea',
        type: 'teas',
        price: 115000,
        badge: isTeaFirst ? 'PRIMARY ROUTINE' : 'RECOMMENDED PAIRING',
        image: '/images/products/spearmint-tea.jpg',
        reason: 'Crisp high-mountain spearmint, traditionally enjoyed twice daily for soothing digestive comfort and cycle ease.',
        isPairing: !isTeaFirst,
      };

      return {
        title: isTeaFirst
          ? 'Suggested Routine: Herbal Cycle Harmony'
          : 'Suggested Routine: 28-Day Seed Cycling',
        explanation: isTeaFirst
          ? 'Since you prefer warm infusions, we recommend our Organic Gilgit Spearmint Leaf Tea as your lead ritual. Spearmint is a traditional soothing herbal infusion often enjoyed twice daily. You can optionally pair it with our Complete 28-Day Seed Kit to add daily kitchen seeds.'
          : 'Since you prefer a structured food ritual, the Complete 28-Day Kit supplies all 4 raw heirloom seeds portioned for both monthly phases, with an engraved wooden scoop and calendar guide. You can optionally pair it with spearmint tea for a soothing daily cup.',
        products: isTeaFirst ? [spearmintItem, seedKitItem] : [seedKitItem, spearmintItem],
      };
    }

    if (goal === 'sleep_calm') {
      const isTeaFirst = ritual === 'warm_tea' || ritual === 'complete_ritual';
      const teaItem: RecommendedItem = {
        id: 'prod-chamomile',
        name: 'Pure Whole Flower Chamomile Tea',
        slug: 'chamomile-tea',
        type: 'teas',
        price: 125000,
        badge: isTeaFirst ? 'PRIMARY ROUTINE' : 'RECOMMENDED PAIRING',
        image: '/images/products/chamomile-tea.jpg',
        reason: 'Whole dried chamomile blossoms that brew into a fragrant, naturally sweet bedtime cup.',
        isPairing: !isTeaFirst,
      };

      const seedItem: RecommendedItem = {
        id: 'prod-pumpkin',
        name: 'Raw Heirloom Pumpkin Seeds',
        slug: 'pumpkin-seeds',
        type: 'seeds',
        price: 95000,
        badge: isTeaFirst ? 'OPTIONAL PAIRING' : 'PRIMARY ROUTINE',
        image: '/images/products/pumpkin-seeds.jpg',
        reason: 'Rich in natural dietary magnesium and plant protein for an easy, grounding evening snack.',
        isPairing: isTeaFirst,
      };

      return {
        title: 'Suggested Routine: Evening Calm & Sleep',
        explanation: isTeaFirst
          ? 'Pure whole dried chamomile blossoms steep into an aromatic, peaceful evening cup. You can optionally pair it with mineral-rich raw pumpkin seeds to satisfy evening hunger naturally.'
          : 'Mineral-rich raw pumpkin seeds provide natural plant protein and dietary magnesium for an easy evening snack. Pair optionally with whole-blossom chamomile tea for a soothing bedtime cup.',
        products: isTeaFirst ? [teaItem, seedItem] : [seedItem, teaItem],
      };
    }

    if (goal === 'digestion_bloat') {
      const isTeaFirst = ritual === 'warm_tea';
      const flaxItem: RecommendedItem = {
        id: 'prod-flax',
        name: 'Cold-Milled Golden Flax Seeds',
        slug: 'flax-seeds',
        type: 'seeds',
        price: 68000,
        badge: isTeaFirst ? 'OPTIONAL PAIRING' : 'PRIMARY ROUTINE',
        image: '/images/products/flax-seeds.jpg',
        reason: 'Gentle soluble fiber that stirs easily into morning yogurt or oatmeal for natural daily regularity.',
        isPairing: isTeaFirst,
      };

      const spearmintItem: RecommendedItem = {
        id: 'prod-spearmint',
        name: 'Organic Gilgit Spearmint Leaf Tea',
        slug: 'spearmint-tea',
        type: 'teas',
        price: 115000,
        badge: isTeaFirst ? 'PRIMARY ROUTINE' : 'RECOMMENDED PAIRING',
        image: '/images/products/spearmint-tea.jpg',
        reason: 'Pure alpine spearmint leaves to sip warm after meals for refreshing digestive comfort.',
        isPairing: !isTeaFirst,
      };

      return {
        title: 'Suggested Routine: Daily Digestive Ease',
        explanation: isTeaFirst
          ? 'Organic Gilgit spearmint leaves brew into a crisp, refreshing post-meal tea. You can optionally pair it with cold-milled golden flax seeds to add gentle soluble fiber to your morning breakfast.'
          : 'Cold-milled golden flax seeds provide gentle daily soluble fiber for breakfast bowls. You can optionally pair it with loose spearmint leaves for a refreshing post-meal steep.',
        products: isTeaFirst ? [spearmintItem, flaxItem] : [flaxItem, spearmintItem],
      };
    }

    // Default: energy_vitality
    if (ritual === 'complete_ritual') {
      const kitItem: RecommendedItem = {
        id: 'kit-complete',
        name: 'Complete 28-Day Seed Cycling Ritual Kit',
        slug: 'complete-cycle-kit',
        type: 'kits',
        price: 285000,
        badge: 'PRIMARY ROUTINE',
        image: '/images/products/complete-kit.jpg',
        reason: 'Structured all-in-one monthly ritual supplying all 4 raw heirloom seeds with wooden scoop and monthly guide.',
        isPairing: false,
      };

      const greenTeaItem: RecommendedItem = {
        id: 'prod-green-tea',
        name: 'Highland Whole Leaf Green Tea',
        slug: 'green-tea',
        type: 'teas',
        price: 135000,
        badge: 'RECOMMENDED PAIRING',
        image: '/images/products/green-tea.jpg',
        reason: 'Single-estate high-mountain whole leaves with clean, brisk flavor and gentle morning focus.',
        isPairing: true,
      };

      return {
        title: 'Suggested Routine: Complete Monthly Vitality',
        explanation: 'Because you prefer a structured monthly routine, our Complete 28-Day Kit supplies all four nutrient-dense raw seeds with a measuring scoop and daily guide. You can optionally pair it with high-mountain green tea for clean morning focus.',
        products: [kitItem, greenTeaItem],
      };
    }

    const isTeaFirst = ritual === 'warm_tea';
    const sunflowerItem: RecommendedItem = {
      id: 'prod-sunflower',
      name: 'Organic Raw Sunflower Kernels',
      slug: 'sunflower-seeds',
      type: 'seeds',
      price: 72000,
      badge: isTeaFirst ? 'OPTIONAL PAIRING' : 'PRIMARY ROUTINE',
      image: '/images/products/sunflower-seeds.jpg',
      reason: 'Crisp raw kernels packed with Vitamin E, healthy plant fats, and minerals for daily vitality.',
      isPairing: isTeaFirst,
    };

    const greenTeaItem: RecommendedItem = {
      id: 'prod-green-tea',
      name: 'Highland Whole Leaf Green Tea',
      slug: 'green-tea',
      type: 'teas',
      price: 135000,
      badge: isTeaFirst ? 'PRIMARY ROUTINE' : 'RECOMMENDED PAIRING',
      image: '/images/products/green-tea.jpg',
      reason: 'Single-estate high-mountain whole leaves with clean, brisk flavor and gentle morning focus.',
      isPairing: !isTeaFirst,
    };

    return {
      title: 'Suggested Routine: Morning Focus & Energy',
      explanation: isTeaFirst
        ? 'Highland whole leaf green tea delivers clean, brisk morning focus without jitters. You can optionally pair it with crisp raw sunflower kernels for wholesome plant nourishment.'
        : 'Crisp raw sunflower kernels provide Vitamin E and plant protein for an easy daily lift. You can optionally pair them with high-mountain green tea for a clean morning cup.',
      products: isTeaFirst ? [greenTeaItem, sunflowerItem] : [sunflowerItem, greenTeaItem],
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
  // Calculate completed answer progress based on current step:
  // Step 0: 0/3 = 0%
  // Step 1: 1/3 = 33%
  // Step 2: 2/3 = 67%
  const progressPercent = Math.round((currentStep / questions.length) * 100);

  const selectedProducts = recommendations.products.filter((p) => selectedIds.includes(p.id));
  const selectedTotalMinor = selectedProducts.reduce((sum, p) => sum + p.price, 0);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto mb-8 space-y-2">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal">
          Find Your Daily Routine
        </h1>
        <p className="text-sm text-muted-gray">
          Three quick questions to match our edible kitchen seeds or loose mountain teas to your everyday habits.
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
          <div className="text-center max-w-xl mx-auto space-y-2">
            <span className="text-xs uppercase tracking-widest font-semibold text-seedly-primary">
              Your Matched Routine
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
              const checkboxId = `rec-prod-${prod.id}`;
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
                      <Image src={prod.image} alt={prod.name} fill className="object-cover" />
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

                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-serif font-bold text-base text-charcoal">{prod.name}</h3>
                        <p className="text-xs text-muted-gray mt-1 leading-relaxed">{prod.reason}</p>
                      </div>
                      <div className="shrink-0 mt-1 flex items-center">
                        <input
                          id={checkboxId}
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            e.stopPropagation();
                            toggleProductSelection(prod.id);
                          }}
                          aria-label={`Include ${prod.name} in basket`}
                          className="w-5 h-5 rounded border-border-gray text-seedly-dark focus:ring-seedly-primary cursor-pointer accent-seedly-dark"
                        />
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
                  Add Primary Item Only ({formatPKR(recommendations.products[0].price)})
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
                        : selectedIds.length === 1
                        ? `Add to Basket (${formatPKR(selectedTotalMinor)})`
                        : `Add Both Items (${formatPKR(selectedTotalMinor)})`}
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
