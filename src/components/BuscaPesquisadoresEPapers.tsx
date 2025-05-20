
import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

type BuscaTipo = 'papers' | 'autores';

interface Autor {
  name: string;
  orcidId: string;
  hIndex: number;
  totalPublications: number;
  totalCitations: number;
  affiliations: string[];
  professionalExperiences: string[];
  educationDetails: string[];
  publications: {
    title: string;
    year: string;
  }[];
  personalPageUrl: string | null;
  educationSummary?: string;
}

interface Paper {
  title: string;
  authors: string[];
  citationCount: number;
  year: number;
  abstract: string;
  doi: string;
  references: any[];
  recommendations: any[];
  fieldsOfStudy: string[];
}

type Resultado = Autor | Paper;

const BuscaPesquisadoresEPapers: React.FC = () => {
  const [buscaTipo, setBuscaTipo] = useState<BuscaTipo>('papers');
  const [termoBusca, setTermoBusca] = useState('');
  const [resultados, setResultados] = useState<Resultado[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [detalheSelecionado, setDetalheSelecionado] = useState<Resultado | null>(null);

  const isPaper = (item: Resultado): item is Paper => {
    return 'title' in item && 'authors' in item;
  };

  const isAutor = (item: Resultado): item is Autor => {
    return 'name' in item && 'orcidId' in item;
  };

  const fetchResultados = async () => {
    setCarregando(true);
    setErro(null);
    setResultados([]);
    setDetalheSelecionado(null);
    
    try {
      if (buscaTipo === 'papers') {
        const response = await fetch(
          `https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURIComponent(
            termoBusca
          )}&fields=title,authors,citationCount,year,abstract,doi,references,recommendations,fieldsOfStudy`
        );
        
        if (!response.ok) {
          throw new Error(`Erro ao buscar papers: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        setResultados(
          data.data.map((p: any) => ({
            title: p.title,
            authors: p.authors?.map((a: any) => a.name) || [],
            citationCount: p.citationCount || 0,
            year: p.year,
            abstract: p.abstract || 'Resumo não disponível',
            doi: p.doi || 'N/A',
            references: p.references || [],
            recommendations: p.recommendations || [],
            fieldsOfStudy: p.fieldsOfStudy || []
          }))
        );
      } else {
        const ssResponse = await fetch(
          `https://api.semanticscholar.org/graph/v1/author/search?query=${encodeURIComponent(
            termoBusca
          )}&fields=name,authorId,hIndex,publicationCount,citationCount,externalIds`
        );
        
        if (!ssResponse.ok) {
          throw new Error(`Erro ao buscar autores: ${ssResponse.statusText}`);
        }
        
        const ssData = await ssResponse.json();
        const autoresComOrcid = ssData.data.filter((a: any) => a.externalIds && a.externalIds.ORCID);

        const promises = autoresComOrcid.map(async (autor: any) => {
          const orcidId = autor.externalIds.ORCID;
          try {
            const orcidResponse = await fetch(`https://pub.orcid.org/v3.0/${orcidId}`, {
              headers: { Accept: 'application/json' }
            });
            
            if (!orcidResponse.ok) return null;
            
            const orcidData = await orcidResponse.json();

            // Extrair URL da página pessoal, se existir
            const urls = orcidData.person?.urls?.url || [];
            const personalPageUrl = urls.length > 0 ? urls[0].value : null;

            // Extrair resumo educacional
            const educationSummary = orcidData['activities-summary']?.educations?.['education-summary']?.[0]?.
              'organization'?.name || 'Não disponível';

            return {
              name: autor.name,
              orcidId,
              hIndex: autor.hIndex || 0,
              totalPublications: autor.publicationCount || 0,
              totalCitations: autor.citationCount || 0,
              affiliations: orcidData.person?.['affiliations']?.['affiliation-group']?.map(
                (aff: any) => aff['affiliation-summary']?.['organization']?.name
              ) || [],
              professionalExperiences:
                orcidData['activities-summary']?.employments?.['employment-summary']?.map(
                  (emp: any) => emp['role-title']
                ) || [],
              educationDetails:
                orcidData['activities-summary']?.educations?.['education-summary']?.map(
                  (edu: any) => edu['role-title']
                ) || [],
              publications:
                orcidData['activities-summary']?.works?.group?.map((w: any) => ({
                  title: w['work-summary']?.[0]?.title?.title?.value || 'Título não disponível',
                  year: w['work-summary']?.[0]?.['publication-date']?.year?.value || 'N/A'
                })) || [],
              personalPageUrl,
              educationSummary
            };
          } catch (error) {
            console.error(`Erro ao buscar dados do ORCID para ${orcidId}:`, error);
            return null;
          }
        });

        const results = await Promise.all(promises);
        setResultados(results.filter((r): r is Autor => r !== null));
      }
    } catch (error) {
      setErro((error as Error).message || 'Erro desconhecido');
    } finally {
      setCarregando(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (termoBusca.trim()) {
      fetchResultados();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end">
          <div className="w-full md:w-1/4">
            <label htmlFor="buscaTipo" className="block text-sm font-medium mb-2">
              Buscar por
            </label>
            <Select
              value={buscaTipo}
              onValueChange={(value: BuscaTipo) => setBuscaTipo(value)}
            >
              <SelectTrigger id="buscaTipo">
                <SelectValue placeholder="Tipo de busca" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="papers">Publicações</SelectItem>
                <SelectItem value="autores">Autores</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex-1 relative">
            <label htmlFor="termoBusca" className="block text-sm font-medium mb-2">
              Digite o termo da busca
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                id="termoBusca"
                type="text"
                placeholder={
                  buscaTipo === 'papers'
                    ? 'Digite o título do paper...'
                    : 'Digite o nome do autor...'
                }
                value={termoBusca}
                onChange={(e) => setTermoBusca(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <Button type="submit" className="bg-tea hover:bg-tea-dark">
            Buscar
          </Button>
        </div>
      </form>

      {carregando && (
        <div className="space-y-4">
          <Skeleton className="w-full h-12" />
          <Skeleton className="w-full h-12" />
          <Skeleton className="w-full h-12" />
        </div>
      )}

      {erro && (
        <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
          Erro ao buscar dados: {erro}
        </div>
      )}

      {!carregando && !erro && resultados.length > 0 && (
        <div className="space-y-4 mb-8">
          <h2 className="text-xl font-bold">
            Resultados da busca ({resultados.length})
          </h2>
          
          <div className="divide-y divide-gray-200 border rounded-lg bg-white">
            {resultados.map((item, index) => (
              <div key={index} className="p-4 hover:bg-gray-50">
                {isPaper(item) ? (
                  <div>
                    <h3 className="font-medium text-tea-dark">{item.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Autores: {item.authors.join(', ')}
                    </p>
                    <div className="flex gap-2 mt-2 text-xs text-gray-500">
                      <span>Áreas: {item.fieldsOfStudy.join(', ')}</span>
                      <span>•</span>
                      <span>Citações: {item.citationCount}</span>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h3 className="font-medium text-tea-dark">{item.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Formação: {item.educationSummary || 'Não disponível'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Índice H: {item.hIndex}</p>
                  </div>
                )}
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setDetalheSelecionado(item)}
                  className="mt-2"
                >
                  Ver detalhes
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {detalheSelecionado && (
        <Card className="mt-6">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-4">
              {isPaper(detalheSelecionado)
                ? `Detalhes do Paper: ${detalheSelecionado.title}`
                : `Detalhes do Autor: ${detalheSelecionado.name}`}
            </h2>

            {isPaper(detalheSelecionado) && (
              <div className="space-y-3">
                <p>
                  <span className="font-medium">Resumo:</span>{' '}
                  {detalheSelecionado.abstract || 'Não disponível'}
                </p>
                <p>
                  <span className="font-medium">Ano:</span> {detalheSelecionado.year || 'N/A'}
                </p>
                <p>
                  <span className="font-medium">Autores:</span>{' '}
                  {detalheSelecionado.authors.join(', ')}
                </p>
                <p>
                  <span className="font-medium">DOI:</span> {detalheSelecionado.doi}
                </p>
                <p>
                  <span className="font-medium">Número de citações:</span>{' '}
                  {detalheSelecionado.citationCount}
                </p>
                <p>
                  <span className="font-medium">Referências:</span>{' '}
                  {detalheSelecionado.references.length}
                </p>

                {detalheSelecionado.references.length > 0 && (
                  <div className="mt-4">
                    <h3 className="font-medium mb-2">Lista de referências:</h3>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                      {detalheSelecionado.references.slice(0, 5).map((ref: any, idx) => (
                        <li key={idx}>{ref.title || 'Título não disponível'} ({ref.year || 'N/A'})</li>
                      ))}
                      {detalheSelecionado.references.length > 5 && (
                        <li className="list-none italic">
                          E mais {detalheSelecionado.references.length - 5} referências...
                        </li>
                      )}
                    </ul>
                  </div>
                )}

                {detalheSelecionado.recommendations?.length > 0 && (
                  <div className="mt-4">
                    <h3 className="font-medium mb-2">Artigos recomendados semanticamente:</h3>
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                      {detalheSelecionado.recommendations.map((rec: any, idx) => (
                        <li key={idx}>{rec.title}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {isAutor(detalheSelecionado) && (
              <div className="space-y-3">
                <p>
                  <span className="font-medium">ORCID ID:</span> {detalheSelecionado.orcidId}
                </p>
                <p>
                  <span className="font-medium">Página pessoal:</span>{' '}
                  {detalheSelecionado.personalPageUrl || 'Não disponível'}
                </p>
                <p>
                  <span className="font-medium">Afiliações:</span>{' '}
                  {detalheSelecionado.affiliations.length > 0
                    ? detalheSelecionado.affiliations.join(', ')
                    : 'Não disponível'}
                </p>
                <p>
                  <span className="font-medium">Experiências profissionais:</span>{' '}
                  {detalheSelecionado.professionalExperiences.length > 0
                    ? detalheSelecionado.professionalExperiences.join(', ')
                    : 'Não disponível'}
                </p>
                <p>
                  <span className="font-medium">Formação acadêmica:</span>{' '}
                  {detalheSelecionado.educationDetails.length > 0
                    ? detalheSelecionado.educationDetails.join(', ')
                    : 'Não disponível'}
                </p>
                
                <div className="mt-4">
                  <h3 className="font-medium mb-2">Lista de publicações (resumo):</h3>
                  {detalheSelecionado.publications.length > 0 ? (
                    <ul className="list-disc pl-5 space-y-1 text-sm">
                      {detalheSelecionado.publications.slice(0, 5).map((pub, idx) => (
                        <li key={idx}>
                          {pub.title} ({pub.year})
                        </li>
                      ))}
                      {detalheSelecionado.publications.length > 5 && (
                        <li className="list-none italic">
                          E mais {detalheSelecionado.publications.length - 5} publicações...
                        </li>
                      )}
                    </ul>
                  ) : (
                    <p className="text-sm italic">Não há publicações disponíveis</p>
                  )}
                </div>
                
                <p>
                  <span className="font-medium">Número total de publicações:</span>{' '}
                  {detalheSelecionado.totalPublications}
                </p>
                <p>
                  <span className="font-medium">Número total de citações:</span>{' '}
                  {detalheSelecionado.totalCitations}
                </p>
                <p>
                  <span className="font-medium">Índice H:</span> {detalheSelecionado.hIndex}
                </p>
              </div>
            )}

            <Button 
              className="mt-4" 
              variant="outline" 
              onClick={() => setDetalheSelecionado(null)}
            >
              Voltar aos resultados
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BuscaPesquisadoresEPapers;
