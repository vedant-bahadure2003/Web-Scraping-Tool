"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CompanyData, ScrapingProgress } from "@/types/scraping";
import {
  Download,
  Search,
  ExternalLink,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Users,
  Building2,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

interface ResultsDisplayProps {
  results: CompanyData[];
  isLoading: boolean;
  progress: ScrapingProgress;
}

export function ResultsDisplay({
  results,
  isLoading,
  progress,
}: ResultsDisplayProps) {
  const [searchFilter, setSearchFilter] = useState("");
  const [sortBy, setSortBy] = useState<keyof CompanyData>("companyName");

  const filteredResults = results.filter(
    (company) =>
      company.companyName.toLowerCase().includes(searchFilter.toLowerCase()) ||
      company.industry?.toLowerCase().includes(searchFilter.toLowerCase()) ||
      company.location?.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const sortedResults = [...filteredResults].sort((a, b) => {
    const aValue = a[sortBy] || "";
    const bValue = b[sortBy] || "";
    return aValue.toString().localeCompare(bValue.toString());
  });

  const exportToJSON = () => {
    const blob = new Blob([JSON.stringify(results, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `company-data-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Data exported as JSON");
  };

  const exportToCSV = () => {
    if (results.length === 0) {
      toast.error("No data to export");
      return;
    }

    const headers = [
      "Company Name",
      "Website",
      "Email",
      "Phone",
      "Industry",
      "Location",
      "Founded",
      "Description",
    ];
    const csvData = [
      headers.join(","),
      ...results.map((company) =>
        [
          `"${company.companyName}"`,
          `"${company.websiteUrl}"`,
          `"${company.email || ""}"`,
          `"${company.phone || ""}"`,
          `"${company.industry || ""}"`,
          `"${company.location || ""}"`,
          `"${company.foundedYear || ""}"`,
          `"${(company.description || "").replace(/"/g, '""')}"`,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvData], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `company-data-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Data exported as CSV");
  };

  if (isLoading) {
    return (
      <Card className="bg-white/10 backdrop-blur-sm border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            Extracting Data...
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center py-12">
            <div className="animate-pulse space-y-4">
              <div className="w-full h-4 bg-white/20 rounded"></div>
              <div className="w-3/4 h-4 bg-white/20 rounded mx-auto"></div>
              <div className="w-1/2 h-4 bg-white/20 rounded mx-auto"></div>
            </div>
            <p className="text-slate-300 mt-6">
              {progress.currentUrl
                ? `Processing: ${progress.currentUrl}`
                : "Initializing scraper..."}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-white flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Results ({results.length})
          </CardTitle>
          {results.length > 0 && (
            <div className="flex gap-2">
              <Button
                onClick={exportToJSON}
                variant="outline"
                size="sm"
                className="border-white/20 bg-transparent text-white hover:bg-white/10"
              >
                <Download className="w-4 h-4 mr-2" />
                JSON
              </Button>
              <Button
                onClick={exportToCSV}
                variant="outline"
                size="sm"
                className="border-white/20 bg-transparent text-white hover:bg-white/10"
              >
                <Download className="w-4 h-4 mr-2" />
                CSV
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {results.length > 0 ? (
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Filter companies..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/20">
                    <TableHead className="text-slate-300">Company</TableHead>
                    <TableHead className="text-slate-300">Contact</TableHead>
                    <TableHead className="text-slate-300">Details</TableHead>
                    <TableHead className="text-slate-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedResults.map((company) => (
                    <TableRow
                      key={company.id}
                      className="border-white/20 hover:bg-white/5"
                    >
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium text-white">
                            {company.companyName}
                          </div>
                          {company.industry && (
                            <Badge
                              variant="outline"
                              className="text-xs border-blue-500/50 text-blue-300"
                            >
                              {company.industry}
                            </Badge>
                          )}
                          {company.confidence && (
                            <div className="text-xs text-slate-400">
                              Confidence: {Math.round(company.confidence * 100)}
                              %
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2 text-sm">
                          {company.email && (
                            <div className="flex items-center gap-2 text-slate-300">
                              <Mail className="w-3 h-3" />
                              <span className="truncate">{company.email}</span>
                            </div>
                          )}
                          {company.phone && (
                            <div className="flex items-center gap-2 text-slate-300">
                              <Phone className="w-3 h-3" />
                              <span>{company.phone}</span>
                            </div>
                          )}
                          {company.location && (
                            <div className="flex items-center gap-2 text-slate-300">
                              <MapPin className="w-3 h-3" />
                              <span className="truncate">
                                {company.location}
                              </span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 text-sm">
                          {company.foundedYear && (
                            <div className="flex items-center gap-2 text-slate-300">
                              <Calendar className="w-3 h-3" />
                              <span>Founded {company.foundedYear}</span>
                            </div>
                          )}
                          {company.employeeSize && (
                            <div className="flex items-center gap-2 text-slate-300">
                              <Users className="w-3 h-3" />
                              <span>{company.employeeSize}</span>
                            </div>
                          )}
                          {company.description && (
                            <div className="text-slate-400 text-xs truncate max-w-xs">
                              {company.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            window.open(company.websiteUrl, "_blank")
                          }
                          className="border-white/20 bg-transparent text-white hover:bg-white/10"
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          Visit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <Building2 className="w-12 h-12 text-slate-500 mx-auto mb-4" />
            <p className="text-slate-300 text-lg">No results yet</p>
            <p className="text-slate-400 text-sm">
              Start a scraping operation to see company data here
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
