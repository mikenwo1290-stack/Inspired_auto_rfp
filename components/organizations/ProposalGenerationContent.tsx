"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

interface ProposalGenerationContentProps {
  params: Promise<{ orgId: string }>;
}

interface ProposalDocxtPastPerformanceEntry {
  client: string;
  value: string;
  scope: string;
  performance: string;
}

interface ProposalDocxtPayload {
  Client_Name: string;
  DUNS: string;
  Cage_Code: string;
  GSA_Contract: string;
  SAM_UEI: string;
  TIN: string;
  RFQ: string;
  Submitted_to: string;
  submitted_to_email: string;
  primary_contact_name: string;
  primary_contact_title: string;
  primary_contact_phone: string;
  primary_contact_email: string;
  company_name: string;
  company_address: string;
  company_website: string;
  delivery_location: string;
  estimated_delivery_date: string;
  total_price: string;
  expiration_date: string;
  authorized_negotiators: string[];
  certifications: string[];
  past_performance: ProposalDocxtPastPerformanceEntry[];
  product: {
    model: string;
    quantity: number;
    processor: string;
    memory: string;
    storage: string;
    display: string;
    os: string;
    battery: string;
    warranty: string;
  };
  compliance: {
    tax_liability: string;
    criminal_violation: string;
    sam_status: string;
    small_business: string;
  };
}

interface PastPerformanceEntry {
  client: string;
  value: string;
  scope: string;
  performance: string;
}

interface ProductDetails {
  model: string;
  quantity: string;
  processor: string;
  memory: string;
  storage: string;
  display: string;
  os: string;
  battery: string;
  warranty: string;
}

interface ComplianceDetails {
  taxLiability: string;
  criminalViolation: string;
  samStatus: string;
  smallBusiness: string;
}

interface ProposalFormState {
  clientName: string;
  duns: string;
  cageCode: string;
  gsaContract: string;
  samUei: string;
  tin: string;
  rfq: string;
  submittedTo: string;
  submittedToEmail: string;
  primaryContactName: string;
  primaryContactTitle: string;
  primaryContactPhone: string;
  primaryContactEmail: string;
  companyName: string;
  companyAddress: string;
  companyWebsite: string;
  deliveryLocation: string;
  estimatedDeliveryDate: string;
  totalPrice: string;
  expirationDate: string;
  authorizedNegotiators: string[];
  certifications: string[];
  pastPerformance: PastPerformanceEntry[];
  product: ProductDetails;
  compliance: ComplianceDetails;
}

const initialFormState: ProposalFormState = {
  clientName: "NCTAMS LANT N7027225Q0037",
  duns: "079836583",
  cageCode: "7E4D8",
  gsaContract: "47QTCA22D00DQ",
  samUei: "NQ9QKJM2Z1E8",
  tin: "47-3303076",
  rfq: "RFQ1776575",
  submittedTo: "Angela Parker",
  submittedToEmail: "angela.m.parker58.civ@us.navy.mil",
  primaryContactName: "Rick Piña",
  primaryContactTitle: "Chief Operating Officer & Chief Revenue Officer",
  primaryContactPhone: "706.564.5274",
  primaryContactEmail: "INSERT_EMAIL",
  companyName: "Inspired Solutions, Inc.",
  companyAddress: "10432 Balls Ford Road, Suite 332, Manassas, VA 20109",
  companyWebsite: "https://inspired-us.com",
  deliveryLocation: "N70272 NCTAMS LANT, 1518 Piersey Street, BLDG MB-100, Norfolk, VA 23511-2784",
  estimatedDeliveryDate: "5-7 business days from receipt of purchase order",
  totalPrice: "INSERT_TOTAL_PRICE",
  expirationDate: "INSERT_EXPIRATION_DATE",
  authorizedNegotiators: ["Rick Piña, COO/CRO", "April Moshos, Sales Director"],
  certifications: [
    "8(a) Certified Small Disadvantaged Business",
    "Service-Disabled Veteran-Owned Small Business (SDVOSB)",
    "Minority/Woman-Owned Business Enterprise (M/WBE)",
    "Economically Disadvantaged Woman-Owned Small Business (EDWOSB)",
    "ISO 9001:2015 Certified Quality Management System",
    "Great Place to Work Certified (2023-2024)",
  ],
  pastPerformance: [
    {
      client: "National Geospatial-Intelligence Agency (NGA)",
      value: "$11,965,274.88",
      scope: "IT infrastructure procurement and integration",
      performance: "100% on-time delivery, zero defects",
    },
    {
      client: "Eli Lilly",
      value: "$4,591,601.40",
      scope: "3,000 laptop procurement and delivery",
      performance: "100% on-time delivery",
    },
    {
      client: "Department of Veterans Affairs",
      value: "$740,259.84",
      scope: "IT infrastructure and equipment for VA facilities",
      performance: "Consistent excellence",
    },
  ],
  product: {
    model: "Dell Pro Rugged Laptop RB14250 (210-BNNH)",
    quantity: "5",
    processor: "Intel Core Ultra 5 125U",
    memory: "16GB DDR5 5600",
    storage: "512GB PCIe NVMe 2230 SSD",
    display: '14" FHD 1920x1080, 400 nit, Anti-Glare',
    os: "Windows 11 Pro",
    battery: "3 Cell 53.5 Whr",
    warranty: "3 Years ProSupport Flex Onsite",
  },
  compliance: {
    taxLiability: "IS NOT a corporation with unpaid Federal tax liability",
    criminalViolation: "IS NOT convicted under Federal law within preceding 24 months",
    samStatus: "Active registration in SAM.gov",
    smallBusiness: "Meets all set-aside requirements",
  },
};

function sanitizeFilename(filename: string) {
  const trimmed = filename.trim() || "proposal.docx";
  const ensured = trimmed.toLowerCase().endsWith(".docx") ? trimmed : `${trimmed}.docx`;
  return ensured.replace(/[^a-zA-Z0-9_.-]/g, "_");
}

function buildPayload(form: ProposalFormState) {
  const authorizedNegotiators = form.authorizedNegotiators
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);

  const certifications = form.certifications
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);

  const pastPerformance = form.pastPerformance
    .filter((entry) => entry.client.trim().length > 0)
    .map<ProposalDocxtPastPerformanceEntry>((entry) => ({
      client: entry.client,
      value: entry.value,
      scope: entry.scope,
      performance: entry.performance,
    }));

  return {
    Client_Name: form.clientName,
    DUNS: form.duns,
    Cage_Code: form.cageCode,
    GSA_Contract: form.gsaContract,
    SAM_UEI: form.samUei,
    TIN: form.tin,
    RFQ: form.rfq,
    Submitted_to: form.submittedTo,
    submitted_to_email: form.submittedToEmail,
    primary_contact_name: form.primaryContactName,
    primary_contact_title: form.primaryContactTitle,
    primary_contact_phone: form.primaryContactPhone,
    primary_contact_email: form.primaryContactEmail,
    company_name: form.companyName,
    company_address: form.companyAddress,
    company_website: form.companyWebsite,
    delivery_location: form.deliveryLocation,
    estimated_delivery_date: form.estimatedDeliveryDate,
    total_price: form.totalPrice,
    expiration_date: form.expirationDate,
    authorized_negotiators: authorizedNegotiators,
    certifications,
    past_performance: pastPerformance,
    product: {
      model: form.product.model,
      quantity: Number(form.product.quantity) || 0,
      processor: form.product.processor,
      memory: form.product.memory,
      storage: form.product.storage,
      display: form.product.display,
      os: form.product.os,
      battery: form.product.battery,
      warranty: form.product.warranty,
    },
    compliance: {
      tax_liability: form.compliance.taxLiability,
      criminal_violation: form.compliance.criminalViolation,
      sam_status: form.compliance.samStatus,
      small_business: form.compliance.smallBusiness,
    },
  } satisfies ProposalDocxtPayload;
}

export function ProposalGenerationContent({ params }: ProposalGenerationContentProps) {
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ProposalFormState>(initialFormState);
  const [templateFile, setTemplateFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>("Inspired-Solutions-Proposal.docx");
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    (async () => {
      const { orgId } = await params;
      setOrganizationId(orgId);
    })();
  }, [params]);

  const negotiatorCount = formData.authorizedNegotiators.length;
  const certificationCount = formData.certifications.length;
  const pastPerformanceCount = formData.pastPerformance.length;

  const payloadPreview = useMemo(() => buildPayload(formData), [formData]);

  const handleAuthorizedNegotiatorChange = (index: number, value: string) => {
    setFormData((prev) => {
      const updated = [...prev.authorizedNegotiators];
      updated[index] = value;
      return { ...prev, authorizedNegotiators: updated };
    });
  };

  const handleCertificationChange = (index: number, value: string) => {
    setFormData((prev) => {
      const updated = [...prev.certifications];
      updated[index] = value;
      return { ...prev, certifications: updated };
    });
  };

  const handlePastPerformanceChange = (index: number, key: keyof PastPerformanceEntry, value: string) => {
    setFormData((prev) => {
      const updated = [...prev.pastPerformance];
      updated[index] = { ...updated[index], [key]: value };
      return { ...prev, pastPerformance: updated };
    });
  };

  const addNegotiator = () => {
    setFormData((prev) => ({
      ...prev,
      authorizedNegotiators: [...prev.authorizedNegotiators, ""],
    }));
  };

  const removeNegotiator = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      authorizedNegotiators: prev.authorizedNegotiators.filter((_, idx) => idx !== index),
    }));
  };

  const addCertification = () => {
    setFormData((prev) => ({
      ...prev,
      certifications: [...prev.certifications, ""],
    }));
  };

  const removeCertification = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      certifications: prev.certifications.filter((_, idx) => idx !== index),
    }));
  };

  const addPastPerformance = () => {
    setFormData((prev) => ({
      ...prev,
      pastPerformance: [
        ...prev.pastPerformance,
        {
          client: "",
          value: "",
          scope: "",
          performance: "",
        },
      ],
    }));
  };

  const removePastPerformance = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      pastPerformance: prev.pastPerformance.filter((_, idx) => idx !== index),
    }));
  };

  const handleGenerate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!organizationId) {
      toast({
        title: "Organization not ready",
        description: "Please wait for the organization context to load.",
        variant: "destructive",
      });
      return;
    }

    if (!templateFile) {
      toast({
        title: "Template required",
        description: "Upload a DOCX template before generating the proposal.",
        variant: "destructive",
      });
      return;
    }

    const sanitizedFilename = sanitizeFilename(fileName);
    const formPayload = new FormData();
    formPayload.append("template", templateFile);
    formPayload.append("payload", JSON.stringify(payloadPreview));
    formPayload.append("fileName", sanitizedFilename);

    setIsGenerating(true);

    try {
      const response = await fetch(`/api/organizations/${organizationId}/proposals/generate`, {
        method: "POST",
        body: formPayload,
      });

      if (!response.ok) {
        let message = "Failed to generate proposal.";
        try {
          const error = await response.json();
          if (error?.error) {
            message = error.error;
          }
        } catch (jsonError) {
          // Ignore JSON parsing errors and use default message.
        }
        throw new Error(message);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = sanitizedFilename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);

      toast({
        title: "Proposal generated",
        description: `Your document has been downloaded as ${sanitizedFilename}.`,
      });
    } catch (error) {
      const description = error instanceof Error ? error.message : "Unexpected error occurred.";
      toast({
        title: "Generation failed",
        description,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <form onSubmit={handleGenerate} className="space-y-6 pb-12">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Generate Proposal</h1>
          <p className="text-muted-foreground mt-2">
            Upload a DOCX template, tailor the proposal data, and download a ready-to-send contract instantly.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Template Upload</CardTitle>
            <CardDescription>
              Upload a DOCX template that uses docxtemplater tags (e.g. {"{Client Name}"}) to receive data from this
              form.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-[2fr,1fr]">
              <div className="space-y-2">
                <Label htmlFor="template">DOCX Template</Label>
                <Input
                  id="template"
                  type="file"
                  accept=".docx"
                  onChange={(event) => {
                    const file = event.target.files?.[0] ?? null;
                    setTemplateFile(file);
                  }}
                />
                {templateFile && (
                  <p className="text-sm text-muted-foreground">Selected: {templateFile.name}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="fileName">Download Filename</Label>
                <Input
                  id="fileName"
                  value={fileName}
                  onChange={(event) => setFileName(event.target.value)}
                  placeholder="My-Proposal.docx"
                />
                <p className="text-xs text-muted-foreground">The generated document will download with this name.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Client & RFQ</CardTitle>
            <CardDescription>Core identifiers for this submission.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="clientName">Client Name</Label>
                <Input
                  id="clientName"
                  value={formData.clientName}
                  onChange={(event) => setFormData((prev) => ({ ...prev, clientName: event.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rfq">RFQ</Label>
                <Input
                  id="rfq"
                  value={formData.rfq}
                  onChange={(event) => setFormData((prev) => ({ ...prev, rfq: event.target.value }))}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="deliveryLocation">Delivery Location</Label>
                <Textarea
                  id="deliveryLocation"
                  rows={2}
                  value={formData.deliveryLocation}
                  onChange={(event) => setFormData((prev) => ({ ...prev, deliveryLocation: event.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="estimatedDeliveryDate">Estimated Delivery Date</Label>
                <Input
                  id="estimatedDeliveryDate"
                  value={formData.estimatedDeliveryDate}
                  onChange={(event) =>
                    setFormData((prev) => ({ ...prev, estimatedDeliveryDate: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expirationDate">Expiration Date</Label>
                <Input
                  id="expirationDate"
                  value={formData.expirationDate}
                  onChange={(event) => setFormData((prev) => ({ ...prev, expirationDate: event.target.value }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Company Identifiers</CardTitle>
            <CardDescription>Identifiers pulled from your organization profile.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="duns">DUNS</Label>
                <Input
                  id="duns"
                  value={formData.duns}
                  onChange={(event) => setFormData((prev) => ({ ...prev, duns: event.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cageCode">CAGE Code</Label>
                <Input
                  id="cageCode"
                  value={formData.cageCode}
                  onChange={(event) => setFormData((prev) => ({ ...prev, cageCode: event.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gsaContract">GSA Contract</Label>
                <Input
                  id="gsaContract"
                  value={formData.gsaContract}
                  onChange={(event) => setFormData((prev) => ({ ...prev, gsaContract: event.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="samUei">SAM UEI</Label>
                <Input
                  id="samUei"
                  value={formData.samUei}
                  onChange={(event) => setFormData((prev) => ({ ...prev, samUei: event.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tin">TIN</Label>
                <Input
                  id="tin"
                  value={formData.tin}
                  onChange={(event) => setFormData((prev) => ({ ...prev, tin: event.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="totalPrice">Total Price</Label>
                <Input
                  id="totalPrice"
                  value={formData.totalPrice}
                  onChange={(event) => setFormData((prev) => ({ ...prev, totalPrice: event.target.value }))}
                />
              </div>
            </div>
            <Separator />
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  value={formData.companyName}
                  onChange={(event) => setFormData((prev) => ({ ...prev, companyName: event.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyWebsite">Company Website</Label>
                <Input
                  id="companyWebsite"
                  value={formData.companyWebsite}
                  onChange={(event) => setFormData((prev) => ({ ...prev, companyWebsite: event.target.value }))}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="companyAddress">Company Address</Label>
                <Textarea
                  id="companyAddress"
                  rows={2}
                  value={formData.companyAddress}
                  onChange={(event) => setFormData((prev) => ({ ...prev, companyAddress: event.target.value }))}
                />
              </div>
            </div>
            <Separator />
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold">Certifications</h4>
                  <p className="text-sm text-muted-foreground">
                    Populate certificate tags in the template. Remove entries you don’t need.
                  </p>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={addCertification}>
                  <Plus className="mr-1 h-4 w-4" /> Add certification
                </Button>
              </div>
              <div className="space-y-2">
                {formData.certifications.map((certification, index) => (
                  <div key={`cert-${index}`} className="flex gap-2">
                    <Input
                      value={certification}
                      onChange={(event) => handleCertificationChange(index, event.target.value)}
                    />
                    {certificationCount > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeCertification(index)}
                        aria-label={`Remove certification ${index + 1}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contacts</CardTitle>
            <CardDescription>Primary stakeholders for this proposal.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="submittedTo">Submitted To</Label>
                <Input
                  id="submittedTo"
                  value={formData.submittedTo}
                  onChange={(event) => setFormData((prev) => ({ ...prev, submittedTo: event.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="submittedToEmail">Submitted To Email</Label>
                <Input
                  id="submittedToEmail"
                  value={formData.submittedToEmail}
                  onChange={(event) => setFormData((prev) => ({ ...prev, submittedToEmail: event.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="primaryContactName">Primary Contact Name</Label>
                <Input
                  id="primaryContactName"
                  value={formData.primaryContactName}
                  onChange={(event) => setFormData((prev) => ({ ...prev, primaryContactName: event.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="primaryContactTitle">Primary Contact Title</Label>
                <Input
                  id="primaryContactTitle"
                  value={formData.primaryContactTitle}
                  onChange={(event) => setFormData((prev) => ({ ...prev, primaryContactTitle: event.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="primaryContactPhone">Primary Contact Phone</Label>
                <Input
                  id="primaryContactPhone"
                  value={formData.primaryContactPhone}
                  onChange={(event) => setFormData((prev) => ({ ...prev, primaryContactPhone: event.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="primaryContactEmail">Primary Contact Email</Label>
                <Input
                  id="primaryContactEmail"
                  value={formData.primaryContactEmail}
                  onChange={(event) => setFormData((prev) => ({ ...prev, primaryContactEmail: event.target.value }))}
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold">Authorized Negotiators</h4>
                  <p className="text-sm text-muted-foreground">
                    These values populate the negotiators table in your template.
                  </p>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={addNegotiator}>
                  <Plus className="mr-1 h-4 w-4" /> Add negotiator
                </Button>
              </div>
              <div className="space-y-2">
                {formData.authorizedNegotiators.map((negotiator, index) => (
                  <div key={`neg-${index}`} className="flex gap-2">
                    <Input
                      value={negotiator}
                      onChange={(event) => handleAuthorizedNegotiatorChange(index, event.target.value)}
                    />
                    {negotiatorCount > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeNegotiator(index)}
                        aria-label={`Remove negotiator ${index + 1}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Product Details</CardTitle>
            <CardDescription>Describe the equipment or services included in this proposal.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="productModel">Model</Label>
                <Input
                  id="productModel"
                  value={formData.product.model}
                  onChange={(event) =>
                    setFormData((prev) => ({
                      ...prev,
                      product: { ...prev.product, model: event.target.value },
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="productQuantity">Quantity</Label>
                <Input
                  id="productQuantity"
                  type="number"
                  min={0}
                  value={formData.product.quantity}
                  onChange={(event) =>
                    setFormData((prev) => ({
                      ...prev,
                      product: { ...prev.product, quantity: event.target.value },
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="productProcessor">Processor</Label>
                <Input
                  id="productProcessor"
                  value={formData.product.processor}
                  onChange={(event) =>
                    setFormData((prev) => ({
                      ...prev,
                      product: { ...prev.product, processor: event.target.value },
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="productMemory">Memory</Label>
                <Input
                  id="productMemory"
                  value={formData.product.memory}
                  onChange={(event) =>
                    setFormData((prev) => ({
                      ...prev,
                      product: { ...prev.product, memory: event.target.value },
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="productStorage">Storage</Label>
                <Input
                  id="productStorage"
                  value={formData.product.storage}
                  onChange={(event) =>
                    setFormData((prev) => ({
                      ...prev,
                      product: { ...prev.product, storage: event.target.value },
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="productDisplay">Display</Label>
                <Input
                  id="productDisplay"
                  value={formData.product.display}
                  onChange={(event) =>
                    setFormData((prev) => ({
                      ...prev,
                      product: { ...prev.product, display: event.target.value },
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="productOs">Operating System</Label>
                <Input
                  id="productOs"
                  value={formData.product.os}
                  onChange={(event) =>
                    setFormData((prev) => ({
                      ...prev,
                      product: { ...prev.product, os: event.target.value },
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="productBattery">Battery</Label>
                <Input
                  id="productBattery"
                  value={formData.product.battery}
                  onChange={(event) =>
                    setFormData((prev) => ({
                      ...prev,
                      product: { ...prev.product, battery: event.target.value },
                    }))
                  }
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="productWarranty">Warranty</Label>
                <Input
                  id="productWarranty"
                  value={formData.product.warranty}
                  onChange={(event) =>
                    setFormData((prev) => ({
                      ...prev,
                      product: { ...prev.product, warranty: event.target.value },
                    }))
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Past Performance</CardTitle>
            <CardDescription>Highlight relevant experience to strengthen your proposal.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              {formData.pastPerformance.map((entry, index) => (
                <div key={`pp-${index}`} className="rounded-lg border p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">Engagement {index + 1}</h4>
                    {pastPerformanceCount > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removePastPerformance(index)}
                        aria-label={`Remove engagement ${index + 1}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor={`pp-client-${index}`}>Client</Label>
                      <Input
                        id={`pp-client-${index}`}
                        value={entry.client}
                        onChange={(event) => handlePastPerformanceChange(index, "client", event.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`pp-value-${index}`}>Contract Value</Label>
                      <Input
                        id={`pp-value-${index}`}
                        value={entry.value}
                        onChange={(event) => handlePastPerformanceChange(index, "value", event.target.value)}
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor={`pp-scope-${index}`}>Scope</Label>
                      <Textarea
                        id={`pp-scope-${index}`}
                        rows={2}
                        value={entry.scope}
                        onChange={(event) => handlePastPerformanceChange(index, "scope", event.target.value)}
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor={`pp-performance-${index}`}>Performance</Label>
                      <Textarea
                        id={`pp-performance-${index}`}
                        rows={2}
                        value={entry.performance}
                        onChange={(event) => handlePastPerformanceChange(index, "performance", event.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Button type="button" variant="outline" onClick={addPastPerformance}>
              <Plus className="mr-1 h-4 w-4" /> Add past performance
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Compliance Statements</CardTitle>
            <CardDescription>Standard statements included in federal proposals.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="complianceTax">Tax Liability</Label>
              <Textarea
                id="complianceTax"
                rows={3}
                value={formData.compliance.taxLiability}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    compliance: { ...prev.compliance, taxLiability: event.target.value },
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="complianceCriminal">Criminal Violations</Label>
              <Textarea
                id="complianceCriminal"
                rows={3}
                value={formData.compliance.criminalViolation}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    compliance: { ...prev.compliance, criminalViolation: event.target.value },
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="complianceSam">SAM Status</Label>
              <Textarea
                id="complianceSam"
                rows={3}
                value={formData.compliance.samStatus}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    compliance: { ...prev.compliance, samStatus: event.target.value },
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="complianceSmallBusiness">Small Business</Label>
              <Textarea
                id="complianceSmallBusiness"
                rows={3}
                value={formData.compliance.smallBusiness}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    compliance: { ...prev.compliance, smallBusiness: event.target.value },
                  }))
                }
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4 rounded-lg border bg-muted/40 p-4">
          <div>
            <h2 className="text-lg font-semibold">Template Data Preview</h2>
            <p className="text-sm text-muted-foreground">
              This preview shows exactly what will be sent to docxtemplater. Ensure your template tags align with these
              keys.
            </p>
          </div>
          <pre className="max-h-64 overflow-auto rounded-md bg-background p-3 text-sm text-muted-foreground">
            {JSON.stringify(payloadPreview, null, 2)}
          </pre>
        </div>

        <div className="flex justify-end">
          <Button type="submit" size="lg" disabled={isGenerating || !organizationId}>
            {isGenerating ? "Generating…" : "Generate Proposal"}
          </Button>
        </div>
      </div>
    </form>
  );
}

