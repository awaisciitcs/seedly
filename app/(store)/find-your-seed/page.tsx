'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Compass, Sparkles, Check, ArrowRight, RotateCcw, Heart, Plus } from 'lucide-react';
import { useCart } from '../../../lib/store/cart';
import { formatPKR } from '../../../lib/utils';

interface Question {
  id: string;
  title: string;
  subtitle: string;
  options: {
    label: string;
    description: string;
    icon: string;
    value: string;
  }[];
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
        description: 'PMS relief, regular menstrual rhythm, and gentle endocrine balance.',
        icon: '🌙',
      },
      {
        value: 'digestion_bloat',
        label: 'Digestive Ease & Lightness',
        description: 'Post-meal comfort, reducing bloating, and smooth gut motility.',
        icon: '🌿',
      },
      {
        value: 'sleep_calm',
        label: 'Restful Sleep & Deep Calm',
        description: 'Unwinding mental fatigue, soothing nervous tension before bedtime.',
        icon: '✨',
      },
      {
        value: 'energy_vitality',
        label: 'Natural Energy & Glow',
        description: 'Plant-based protein, healthy fats, and glowing hair, skin & nails.',
        icon: '☀️',
      },
    ],
  },
  {
    id: 'ritual',
    title: 'How do you prefer to take your botanicals?',
    subtitle: 'The best wellness routine is the one you will actually look forward to.',
    options: [
      {
        value: 'spoonful_smoothie',
        label: 'Sprinkled in Food & Smoothies',
        description: 'I love blending into morning shakes, oatmeal bowls, or salads.',
        icon: '🥣',
      },
      {
        value: 'warm_tea',
        label: 'Sipping a Warm Steeped Infusion',
        description: 'A comforting cup of pure whole-flower botanical tea.',
        icon: '🍵',
      },
      {
        value: 'complete_ritual',
        label: 'Structured Monthly Routine',
        description: 'A complete guided kit with calendar and dedicated measuring scoop.',
        icon: '📦',
      },
    ],
  },
  {
    id: 'experience',
    title: 'Have you practiced seed cycling or herbal therapy before?',
    subtitle: 'This helps us tailor the best starting point.',
    options: [
      {
        value: 'beginner',
        label: 'I am completely new',
        description: 'Keep it simple and approachable with easy daily steps.',
        icon: '🌱',
      },
      {
        value: 'intermediate',
        label: 'I know the basics',
        description: 'I already eat seeds and drink herbal teas occasionally.',
        icon: '🪴',
      },
      {
        value: 'daily_practitioner',
        label: 'I have a daily routine',
        description: 'I am looking for the highest grade unbleached alpine harvest.',
        icon: '🌸',
      },
    ],
  },
];

export default function FindYourSeedPage() {
  const { addItem } = useCart();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [completed, setCompleted] = useState(false);
  const [addedAll, setAddedAll] = useState(false);

  const handleSelectOption = (value: string) => {
    const q = questions[currentStep];
    const newAnswers = { ...answers, [q.id]: value };
    setAnswers(newAnswers);

    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setCompleted(true);
    }
  };

  const handleReset = () => {
    setAnswers({});
    setCurrentStep(0);
    setCompleted(false);
    setAddedAll(false);
  };

  // Rule-based recommendation engine (Section 21 / V1.1)
  const getRecommendations = () => {
    const goal = answers.goal;

    if (goal === 'cycle_hormones') {
      return {
        title: 'Your Cycle Nourishment Protocol',
        explanation:
          'Based on your focus on hormonal balance, seed cycling with raw Pumpkin, Flax, Sunflower, and Sesame seeds synchronizes essential fatty acids with your natural follicular and luteal phases.',
        products: [
          {
            id: 'kit-complete',
            name: 'Complete 28-Day Seed Cycling Ritual Kit',
            slug: 'complete-cycle-kit',
            type: 'kits',
            price: 285000,
            badge: 'PRIMARY RECOMMENDATION',
            image: '/images/products/complete-kit.svg',
            reason: 'All 4 heirloom seeds portioned for both phases with brass measuring scoop.',
          },
          {
            id: 'prod-spearmint',
            name: 'Organic Gilgit Spearmint Leaf Tea',
            slug: 'spearmint-tea',
            type: 'teas',
            price: 115000,
            badge: 'COMPLIMENTARY HERB',
            image: '/images/products/spearmint-tea.svg',
            reason: 'Naturally soothes androgenic fluctuations and digestive bloating.',
          },
        ],
      };
    }

    if (goal === 'sleep_calm') {
      return {
        title: 'Your Deep Rest & Nervous Calm Protocol',
        explanation:
          'Your nervous system will thrive with high bioavailable magnesium paired with natural apigenin-rich botanical flowers before sleep.',
        products: [
          {
            id: 'prod-chamomile',
            name: 'Pure Whole Flower Chamomile Tea',
            slug: 'chamomile-tea',
            type: 'teas',
            price: 125000,
            badge: 'PRIMARY BOTANICAL',
            image: '/images/products/chamomile-tea.svg',
            reason: 'Hand-picked whole blossoms from Gilgit with natural soothing honey notes.',
          },
          {
            id: 'prod-pumpkin',
            name: 'Raw Heirloom Pumpkin Seeds',
            slug: 'pumpkin-seeds',
            type: 'seeds',
            price: 95000,
            badge: 'MAGNESIUM RICH',
            image: '/images/products/pumpkin-seeds.svg',
            reason: 'Natural source of tryptophan and magnesium to prime deep REM sleep.',
          },
        ],
      };
    }

    if (goal === 'digestion_bloat') {
      return {
        title: 'Your Digestive Ease & Gut Rhythm Protocol',
        explanation:
          'Rich soluble dietary mucilage from cold-milled golden flax combines seamlessly with mountain spearmint leaves to ease gastrointestinal tension and encourage daily regularity.',
        products: [
          {
            id: 'prod-flax',
            name: 'Cold-Milled Golden Flax Seeds',
            slug: 'flax-seeds',
            type: 'seeds',
            price: 68000,
            badge: 'GUT HEALTH',
            image: '/images/products/flax-seeds.svg',
            reason: 'High soluble prebiotic fiber matrix that supports a healthy microbiome.',
          },
          {
            id: 'prod-spearmint',
            name: 'Organic Gilgit Spearmint Leaf Tea',
            slug: 'spearmint-tea',
            type: 'teas',
            price: 115000,
            badge: 'ANTI-BLOAT',
            image: '/images/products/spearmint-tea.svg',
            reason: 'Crisp mountain spearmint to relax intestinal muscles after heavy meals.',
          },
        ],
      };
    }

    // Default: energy_vitality
    return {
      title: 'Your Daily Vitality & Glow Protocol',
      explanation:
        'A potent antioxidant pairing of Vitamin E-rich sunflower kernels and fresh spring-harvest green tea provides clean, jitter-free energy and cellular nourishment.',
      products: [
        {
          id: 'prod-sunflower',
          name: 'Organic Raw Sunflower Kernels',
          slug: 'sunflower-seeds',
          type: 'seeds',
          price: 72000,
          badge: 'VITAMIN E',
          image: '/images/products/sunflower-seeds.svg',
          reason: 'Concentrated natural d-alpha tocopherol for radiant skin vitality.',
        },
        {
          id: 'prod-green-tea',
          name: 'Highland Whole Leaf Green Tea',
          slug: 'green-tea',
          type: 'teas',
          price: 135000,
          badge: 'CLEAN FOCUS',
          image: '/images/products/green-tea.svg',
          reason: 'EGCG catechins and natural L-theanine for sustained calm morning alertness.',
        },
      ],
    };
  };

  const handleAddBundleToCart = () => {
    const rec = getRecommendations();
    for (const p of rec.products) {
      addItem({
        id: `${p.id}-quiz`,
        product_id: p.id,
        kit_id: p.type === 'kits' ? p.id : undefined,
        name: p.name,
        slug: p.slug,
        price_minor: p.price,
        image_url: p.image,
        quantity: 1,
        product_type: p.type === 'kits' ? 'kit' : (p.type === 'teas' ? 'tea' : 'seed'),
      });
    }
    setAddedAll(true);
    setTimeout(() => setAddedAll(false), 2000);
  };

  const currentQ = questions[currentStep];
  const progressPercent = Math.round(((currentStep + 1) / questions.length) * 100);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto mb-10 space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-seedly-light text-seedly-dark text-xs font-semibold uppercase tracking-wider">
          <Compass className="w-3.5 h-3.5 text-seedly-primary" />
          <span>Personalized Botanical Discovery</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl font-bold text-charcoal">
          Find Your Seed & Tea Ritual
        </h1>
        <p className="text-sm text-muted-gray">
          A 2-minute holistic guide to match Pakistan's purest heirloom botanicals to your body.
        </p>
      </div>

      {!completed ? (
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-border-gray shadow-card animate-fadeIn">
          {/* Progress Bar */}
          <div className="mb-8 space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-gray font-medium">
              <span>
                Step {currentStep + 1} of {questions.length}
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
                    <span className="text-3xl block">{opt.icon}</span>
                    <h3 className="font-serif font-bold text-lg text-charcoal">{opt.label}</h3>
                    <p className="text-xs text-muted-gray leading-relaxed">{opt.description}</p>
                  </div>
                  <div className="pt-4 flex items-center justify-end">
                    <div
                      className={`w-6 h-6 rounded-full border flex items-center justify-center transition-colors ${
                        selected
                          ? 'border-seedly-dark bg-seedly-dark text-white'
                          : 'border-border-gray'
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
              {getRecommendations().title}
            </h2>
            <p className="text-sm text-muted-gray leading-relaxed">
              {getRecommendations().explanation}
            </p>
          </div>

          {/* Recommended Products */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            {getRecommendations().products.map((prod) => (
              <div
                key={prod.id}
                className="rounded-2xl border border-border-gray p-5 bg-cream/30 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-stone/40 border border-border-gray/50 flex items-center justify-center">
                    <Image src={prod.image} alt={prod.name} fill className="object-contain p-3" />
                    <span className="absolute top-2 left-2 px-2 py-0.5 bg-seedly-dark text-white text-[10px] font-bold rounded-full">
                      {prod.badge}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-lg text-charcoal">{prod.name}</h3>
                    <p className="text-xs text-muted-gray mt-1">{prod.reason}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-border-gray flex items-center justify-between">
                  <span className="font-serif font-bold text-lg text-charcoal">
                    {formatPKR(prod.price)}
                  </span>
                  <Link
                    href={`/${prod.type}/${prod.slug}`}
                    className="text-xs font-semibold text-seedly-dark hover:underline"
                  >
                    View Details →
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="pt-6 border-t border-border-gray flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              onClick={handleReset}
              className="text-xs font-semibold text-muted-gray hover:text-charcoal flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retake Quiz</span>
            </button>

            <button
              onClick={handleAddBundleToCart}
              className={`w-full sm:w-auto px-8 py-3.5 rounded-full font-medium text-sm transition-all shadow-card flex items-center justify-center gap-2 ${
                addedAll
                  ? 'bg-emerald-700 text-white'
                  : 'bg-seedly-dark hover:bg-seedly-forest text-white'
              }`}
            >
              {addedAll ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Added Both to Basket!</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Add Recommended Ritual to Basket</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
