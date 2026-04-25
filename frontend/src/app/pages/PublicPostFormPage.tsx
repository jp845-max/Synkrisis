import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Checkbox } from "../components/ui/checkbox";
import { toast } from "sonner";
import { api } from "../lib/api";

export function PublicPostFormPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    fullDescription: "",
    budget: "",
    timeline: "",
    skills: [] as string[],
    deliverables: [] as string[]
  });

  const skillsOptions = ['Web Development', 'Mobile Development', 'UI/UX Design', 'Digital Marketing', 'SEO', 'Content Creation'];
  
  const [deliverableInput, setDeliverableInput] = useState("");

  const handleAddDeliverable = () => {
    if (deliverableInput.trim()) {
      setFormData(prev => ({
        ...prev,
        deliverables: [...prev.deliverables, deliverableInput.trim()]
      }));
      setDeliverableInput("");
    }
  };

  const removeDeliverable = (index: number) => {
    setFormData(prev => ({
      ...prev,
      deliverables: prev.deliverables.filter((_, i) => i !== index)
    }));
  };

  const toggleSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await api.post('/projects', {
        ...formData,
        budget: Number(formData.budget),
        assignmentType: 'public'
      });
      toast.success("Project posted successfully!");
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message || "Failed to post project");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-12" style={{ background: '#0f1117' }}>
      <div className="container mx-auto px-4 max-w-3xl">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6 text-white/60 hover:text-white hover:bg-white/10">
          ← Back
        </Button>
        <Card className="border-white/10 shadow-xl" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <CardHeader className="border-b border-white/10 pb-6">
            <CardTitle className="text-2xl text-white">Post a Public Project</CardTitle>
            <CardDescription className="text-white/50">Fill out the details below to publish your project to the marketplace.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-white/70">Project Title</Label>
                <Input 
                  id="title" 
                  required 
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  placeholder="e.g. E-commerce Website Design" 
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-emerald-500/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-white/70">Short Description</Label>
                <Input 
                  id="description" 
                  required 
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  placeholder="Brief summary of the project" 
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-emerald-500/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullDescription" className="text-white/70">Full Requirements & Description</Label>
                <textarea 
                  id="fullDescription" 
                  required 
                  className="w-full min-h-[120px] flex rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white shadow-sm placeholder:text-white/30 focus-visible:outline-none focus-visible:border-emerald-500/50 resize-y"
                  value={formData.fullDescription}
                  onChange={e => setFormData({...formData, fullDescription: e.target.value})}
                  placeholder="Provide all necessary details..." 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="budget" className="text-white/70">Budget (₹)</Label>
                  <Input 
                    id="budget" 
                    type="number" 
                    required 
                    value={formData.budget}
                    onChange={e => setFormData({...formData, budget: e.target.value})}
                    placeholder="e.g. 50000" 
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-emerald-500/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timeline" className="text-white/70">Timeline</Label>
                  <Input 
                    id="timeline" 
                    value={formData.timeline}
                    onChange={e => setFormData({...formData, timeline: e.target.value})}
                    placeholder="e.g. 4 Weeks" 
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-emerald-500/50"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-white/70">Required Skills</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {skillsOptions.map(skill => (
                    <div key={skill} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`skill-${skill}`}
                        checked={formData.skills.includes(skill)}
                        onCheckedChange={() => toggleSkill(skill)}
                        className="border-white/20 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                      />
                      <label htmlFor={`skill-${skill}`} className="text-sm cursor-pointer text-white/80">{skill}</label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-white/70">Deliverables</Label>
                <div className="flex gap-2">
                  <Input 
                    value={deliverableInput}
                    onChange={e => setDeliverableInput(e.target.value)}
                    placeholder="e.g. Figma Source Files"
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-emerald-500/50"
                    onKeyPress={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddDeliverable();
                      }
                    }}
                  />
                  <Button type="button" variant="secondary" onClick={handleAddDeliverable} className="bg-white/10 text-white hover:bg-white/20 border-0">Add</Button>
                </div>
                {formData.deliverables.length > 0 && (
                  <ul className="mt-3 space-y-2">
                    {formData.deliverables.map((del, index) => (
                      <li key={index} className="text-sm text-white flex items-center justify-between bg-white/5 border border-white/10 p-2.5 rounded-lg">
                        <span>{del}</span>
                        <Button type="button" variant="ghost" size="sm" onClick={() => removeDeliverable(index)} className="h-6 w-6 p-0 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-full">×</Button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <Button type="submit" className="w-full bg-gradient-to-r from-emerald-400 to-cyan-500 hover:from-emerald-300 hover:to-cyan-400 text-white border-0 shadow-lg h-12 text-lg mt-4" disabled={isLoading}>
                {isLoading ? "Posting..." : "Post Project"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
