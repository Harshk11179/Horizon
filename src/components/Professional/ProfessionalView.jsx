import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@hooks/useAppStore';
import { getProjectTypes, getProfessionalAssessment } from '@services/environmentalDataService';
import { generateAssessmentPdf } from '@utils/generateAssessmentPdf';
import Panel from '@components/HolographicPanels/Panel';
import LocationSelector from '@components/Dashboard/LocationSelector';

const ASSESSMENT_FIELDS = [
  { key: 'airQuality', label: 'Air Quality' },
  { key: 'waterStress', label: 'Water Stress' },
  { key: 'greenCover', label: 'Green Cover' },
  { key: 'landCondition', label: 'Land Condition' },
  { key: 'biodiversitySensitivity', label: 'Biodiversity Sensitivity' },
  { key: 'climateRisk', label: 'Climate Risk' },
];

function toneForStatus(status) {
  if (status === 'good' || status === 'low') return 'good';
  if (status === 'high') return 'risk';
  return 'default';
}

export default function ProfessionalView() {
  const selectedLocationId = useAppStore((state) => state.selectedLocationId);
  const setSelectedLocationId = useAppStore((state) => state.setSelectedLocationId);
  const activeLocationId = selectedLocationId ?? 'india';

  const [projectTypes, setProjectTypes] = useState([]);
  const [selectedProjectType, setSelectedProjectType] = useState(null);
  const [assessment, setAssessment] = useState(null);
  const [loadingTypes, setLoadingTypes] = useState(true);
  const [loadingAssessment, setLoadingAssessment] = useState(false);

  // Project types load once — this is reference/lookup data (the list
  // of selectable categories itself), not per-location data, so it
  // isn't refetched when activeLocationId changes.
  useEffect(() => {
    getProjectTypes().then((types) => {
      setProjectTypes(types);
      setSelectedProjectType((prev) => prev ?? types[0]?.id ?? null);
      setLoadingTypes(false);
    });
  }, []);

  useEffect(() => {
    if (!selectedProjectType) return;
    let cancelled = false;
    setLoadingAssessment(true);
    getProfessionalAssessment(activeLocationId, selectedProjectType).then((data) => {
      if (!cancelled) {
        setAssessment(data);
        setLoadingAssessment(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [activeLocationId, selectedProjectType]);

  return (
    <div className="min-h-screen px-6 pt-32 pb-20 max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10"
      >
        <div>
          <h2 className="font-display text-2xl text-mist tracking-wide">
            Pre-Screening Assessment
          </h2>
          <p className="font-mono text-xs text-mist-dim mt-1 uppercase tracking-widest">
            Early environmental overview before formal EIA
          </p>
        </div>
        <LocationSelector activeLocationId={activeLocationId} onSelect={setSelectedLocationId} hotkey />
      </motion.div>

      {/* Project type selector — pill-style buttons rather than a
          native <select>, consistent with the rest of the app's
          custom-styled controls (a native select can't be styled to
          match the glass/glow aesthetic across browsers). */}
      <Panel from="up" delay={0} className="mb-8">
        <div className="font-mono text-[10px] uppercase tracking-wider text-mist-dim mb-3">
          Project Type
        </div>
        {loadingTypes ? (
          <div className="h-9 flex items-center">
            <div className="w-6 h-6 rounded-full border-2 border-neon-blue/20 border-t-neon-blue animate-spin" />
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {projectTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedProjectType(type.id)}
                className={`px-4 py-2 rounded-full text-sm font-body transition-colors duration-200 border ${
                  selectedProjectType === type.id
                    ? 'bg-neon-blue/10 border-neon-blue/40 text-mist'
                    : 'border-white/10 text-mist-dim hover:text-mist hover:border-white/20'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        )}
      </Panel>

      <AnimatePresence mode="wait">
        {loadingAssessment || !assessment ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-64 flex items-center justify-center"
          >
            <div className="w-10 h-10 rounded-full border-2 border-neon-blue/20 border-t-neon-blue animate-spin" />
          </motion.div>
        ) : (
          <motion.div
            key={`${activeLocationId}-${selectedProjectType}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
              {ASSESSMENT_FIELDS.map((field, i) => {
                const data = assessment[field.key];
                const tone = toneForStatus(data?.status);
                return (
                  <Panel
                    key={field.key}
                    from={i % 2 === 0 ? 'left' : 'right'}
                    delay={i * 0.06}
                    tone={tone}
                  >
                    <div className="font-mono text-[10px] uppercase tracking-wider text-mist-dim mb-2">
                      {field.label}
                    </div>
                    <div className="font-mono text-2xl font-medium text-mist tabular-nums">
                      {data?.value}
                      <span className="text-xs ml-1 opacity-60">{data?.unit}</span>
                    </div>
                  </Panel>
                );
              })}
            </div>

            <Panel from="up" delay={0.4} tone="default">
              <div className="font-mono text-[10px] uppercase tracking-wider text-mist-dim mb-3">
                Sustainability Recommendation
              </div>
              <p className="text-mist font-body leading-relaxed">{assessment.recommendation}</p>
              <p className="mt-4 text-xs text-mist-dim font-body italic">
                This pre-screening does not replace the formal Environmental Impact
                Assessment process required through PARIVESH 2.0.
              </p>
            </Panel>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
              className="mt-8 flex justify-end"
            >
              <button
                onClick={() =>
                  generateAssessmentPdf({
                    assessment,
                    projectTypeLabel:
                      projectTypes.find((t) => t.id === selectedProjectType)?.label ??
                      selectedProjectType,
                  })
                }
                className="glass-panel px-5 py-2.5 flex items-center gap-2.5 text-sm font-display tracking-wide text-mist border hover:border-emerald-glow/40 hover:shadow-glow-emerald transition-all duration-300"
              >
                <span className="text-emerald-glow" aria-hidden="true">
                  ↓
                </span>
                Download PDF Report
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
