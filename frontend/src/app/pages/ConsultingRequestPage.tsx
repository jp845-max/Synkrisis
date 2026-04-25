import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Checkbox } from "../components/ui/checkbox";
import { ArrowLeft, Calendar, Send } from "lucide-react";
import { toast } from "sonner";
import { api } from "../lib/api";

export function ConsultingRequestPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    projectDescription: '',
    budgetMin: '',
    budgetMax: '',
    timeline: '',
    preferredSkills: [] as string[],
  });

  const skillsOptions = [
    'Web Development',
    'Mobile Development',
    'UI/UX Design',
    'Digital Marketing',
    'SEO',
    'Content Creation',
    'Branding',
    'Data Analysis',
    'E-commerce',
    'Social Media'
  ];

  const toggleSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      preferredSkills: prev.preferredSkills.includes(skill)
        ? prev.preferredSkills.filter(s => s !== skill)
        : [...prev.preferredSkills, skill]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/consulting', formData);
      toast.success('Consulting request submitted!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit consulting request');
    }
  };

  const handleScheduleCall = async () => {
    try {
      await api.post('/consulting', {
        ...formData,
        scheduledCall: true,
        projectDescription: formData.projectDescription || 'Call Request'
      });
      toast.success('Request pre-saved. Opening Calendly...');
      window.open('https://calendly.com', '_blank');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error('Failed to register call request');
    }
  };

  return (
    <div className="min-h-screen" style={{ background: '#0f1117' }}>
      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-xl" style={{ background: 'rgba(15, 17, 23, 0.8)' }}>
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div 
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate('/dashboard')}
          >
            <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center">
              <img src="/logo.png" alt="Synkrisis" className="w-full h-full object-cover scale-105" />
            </div>
            <span className="text-xl font-bold text-white">Synkrisis</span>
          </div>
          <Button variant="ghost" onClick={() => navigate('/dashboard')} className="text-white/60 hover:text-white hover:bg-white/10">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-white mb-3">Request Consulting</h1>
            <p className="text-white/60">
              Tell us about your project and we'll help you find the perfect builder
            </p>
          </div>

          {/* Consulting Options */}
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            <Card className="cursor-pointer hover:border-white/30 transition-colors border-white/10" style={{ background: 'rgba(255,255,255,0.02)' }} onClick={handleScheduleCall}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 text-white/70" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white mb-1">Schedule a Call</h3>
                    <p className="text-sm text-white/50">
                      Book a time to discuss your project with our team
                    </p>
                    <Button className="mt-4 w-full bg-white/10 hover:bg-white/20 text-white border-0" size="sm">
                      Schedule Now
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-cyan-500/30 relative overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-cyan-500/5 pointer-events-none" />
              <CardContent className="pt-6 relative">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg shadow-cyan-500/20">
                    <Send className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white mb-1">Submit Request</h3>
                    <p className="text-sm text-white/50">
                      Fill out the form below and we'll get back to you
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Request Form */}
          <Card className="border-white/10 shadow-xl" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <CardHeader className="border-b border-white/10 pb-6">
              <CardTitle className="text-xl text-white">Project Details</CardTitle>
              <CardDescription className="text-white/50">
                Provide as much detail as possible to help us understand your needs
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Project Description */}
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-white/70">Project Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your project, what you're looking to build, and any specific requirements you have..."
                    rows={6}
                    value={formData.projectDescription}
                    onChange={(e) => setFormData(prev => ({ ...prev, projectDescription: e.target.value }))}
                    required
                    className="resize-none bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-emerald-500/50"
                  />
                  <p className="text-xs text-white/40 mt-1">Be as detailed as possible</p>
                </div>

                {/* Budget Range */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="budget-min" className="text-white/70">Minimum Budget (INR)</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">₹</span>
                      <Input
                        id="budget-min"
                        type="number"
                        placeholder="10,000"
                        value={formData.budgetMin}
                        onChange={(e) => setFormData(prev => ({ ...prev, budgetMin: e.target.value }))}
                        required
                        className="pl-7 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-emerald-500/50"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="budget-max" className="text-white/70">Maximum Budget (INR)</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">₹</span>
                      <Input
                        id="budget-max"
                        type="number"
                        placeholder="50,000"
                        value={formData.budgetMax}
                        onChange={(e) => setFormData(prev => ({ ...prev, budgetMax: e.target.value }))}
                        required
                        className="pl-7 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-emerald-500/50"
                      />
                    </div>
                  </div>
                </div>

                {/* Timeline */}
                <div className="space-y-2">
                  <Label htmlFor="timeline" className="text-white/70">Expected Timeline</Label>
                  <Input
                    id="timeline"
                    type="text"
                    placeholder="e.g., 2-3 months, 6 weeks, ASAP"
                    value={formData.timeline}
                    onChange={(e) => setFormData(prev => ({ ...prev, timeline: e.target.value }))}
                    required
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-emerald-500/50"
                  />
                </div>

                {/* Preferred Skills */}
                <div className="space-y-3">
                  <Label className="block text-white/70">Preferred Skills</Label>
                  <p className="text-sm text-white/40 mb-3">
                    Select the skills you think will be needed for your project
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {skillsOptions.map(skill => (
                      <div key={skill} className="flex items-center space-x-2">
                        <Checkbox
                          id={`skill-${skill}`}
                          checked={formData.preferredSkills.includes(skill)}
                          onCheckedChange={() => toggleSkill(skill)}
                          className="border-white/20 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                        />
                        <label
                          htmlFor={`skill-${skill}`}
                          className="text-sm cursor-pointer text-white/80"
                        >
                          {skill}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <Button type="submit" className="w-full bg-gradient-to-r from-emerald-400 to-cyan-500 hover:from-emerald-300 hover:to-cyan-400 text-white border-0 shadow-lg h-12 text-lg" size="lg">
                    <Send className="w-4 h-4 mr-2" />
                    Submit Request
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Info Section */}
          <Card className="mt-6 border-white/10" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <CardContent className="pt-6">
              <h3 className="font-semibold text-white mb-3">What happens next?</h3>
              <ol className="list-decimal list-inside space-y-2 text-sm text-white/60">
                <li>Our platform team will review your consulting request</li>
                <li>We'll use our algorithm and expertise to identify the best builders for your project</li>
                <li>You'll receive recommendations and can review builder profiles</li>
                <li>Once you select a builder, we'll help facilitate the project setup</li>
              </ol>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
