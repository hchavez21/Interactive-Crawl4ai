import { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Switch } from '@/components/ui/switch.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Progress } from '@/components/ui/progress.jsx'
import { Alert, AlertDescription } from '@/components/ui/alert.jsx'
import { 
  Globe, 
  Download, 
  Settings, 
  Play, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  Code,
  FileText,
  Image,
  Zap,
  Brain,
  Monitor
} from 'lucide-react'
import './App.css'

function App() {
  const [url, setUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [results, setResults] = useState(null)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('simple')
  
  // Configuration states
  const [config, setConfig] = useState({
    headless: true,
    screenshots: false,
    extractImages: false,
    extractLinks: true,
    waitTime: 3,
    userAgent: 'default',
    outputFormat: 'markdown'
  })

  const [extractionConfig, setExtractionConfig] = useState({
    useAI: false,
    schema: '',
    cssSelector: '',
    extractionPrompt: ''
  })

  const handleCrawl = async () => {
    if (!url.trim()) {
      setError('Please enter a valid URL')
      return
    }

    setIsLoading(true)
    setError('')
    setProgress(0)
    
    // Simulate progress updates
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return 90
        }
        return prev + 10
      })
    }, 500)

    try {
      // Call the backend API
      const response = await fetch('/api/crawl', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: url,
          config: config,
          extractionConfig: extractionConfig
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.success) {
        setResults(data)
        setProgress(100)
      } else {
        throw new Error(data.error || 'Crawling failed')
      }
    } catch (err) {
      setError(`Failed to crawl the URL: ${err.message}`)
    } finally {
      setIsLoading(false)
      clearInterval(progressInterval)
    }
  }

  const downloadResults = (format) => {
    if (!results) return
    
    let content = ''
    let filename = ''
    
    switch (format) {
      case 'markdown':
        content = results.markdown
        filename = 'crawl-results.md'
        break
      case 'json':
        content = JSON.stringify(results.extractedData, null, 2)
        filename = 'crawl-results.json'
        break
      default:
        return
    }
    
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Globe className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Crawl4AI</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Interactive Web Crawler</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <Zap className="h-3 w-3 mr-1" />
                v0.7.0
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* URL Input Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="h-5 w-5" />
                  <span>Web Crawler</span>
                </CardTitle>
                <CardDescription>
                  Enter a URL to extract content, generate markdown, and analyze web pages with AI-powered tools.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex space-x-2">
                  <Input
                    placeholder="https://example.com"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleCrawl} 
                    disabled={isLoading}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Crawling...
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Crawl
                      </>
                    )}
                  </Button>
                </div>
                
                {isLoading && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Crawling in progress...</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} className="w-full" />
                  </div>
                )}
                
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Configuration Tabs */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5" />
                  <span>Configuration</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="simple">Simple</TabsTrigger>
                    <TabsTrigger value="advanced">Advanced</TabsTrigger>
                    <TabsTrigger value="extraction">AI Extraction</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="simple" className="space-y-4 mt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <Switch 
                          id="screenshots"
                          checked={config.screenshots}
                          onCheckedChange={(checked) => setConfig(prev => ({...prev, screenshots: checked}))}
                        />
                        <Label htmlFor="screenshots">Take Screenshots</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch 
                          id="images"
                          checked={config.extractImages}
                          onCheckedChange={(checked) => setConfig(prev => ({...prev, extractImages: checked}))}
                        />
                        <Label htmlFor="images">Extract Images</Label>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="advanced" className="space-y-4 mt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Wait Time (seconds)</Label>
                        <Input 
                          type="number" 
                          value={config.waitTime}
                          onChange={(e) => setConfig(prev => ({...prev, waitTime: parseInt(e.target.value)}))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Output Format</Label>
                        <Select value={config.outputFormat} onValueChange={(value) => setConfig(prev => ({...prev, outputFormat: value}))}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="markdown">Markdown</SelectItem>
                            <SelectItem value="json">JSON</SelectItem>
                            <SelectItem value="html">HTML</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="headless"
                        checked={config.headless}
                        onCheckedChange={(checked) => setConfig(prev => ({...prev, headless: checked}))}
                      />
                      <Label htmlFor="headless">Headless Mode</Label>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="extraction" className="space-y-4 mt-4">
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="useAI"
                        checked={extractionConfig.useAI}
                        onCheckedChange={(checked) => setExtractionConfig(prev => ({...prev, useAI: checked}))}
                      />
                      <Label htmlFor="useAI">Enable AI Extraction</Label>
                    </div>
                    {extractionConfig.useAI && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Extraction Prompt</Label>
                          <Textarea 
                            placeholder="Describe what you want to extract from the page..."
                            value={extractionConfig.extractionPrompt}
                            onChange={(e) => setExtractionConfig(prev => ({...prev, extractionPrompt: e.target.value}))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>CSS Selector (Optional)</Label>
                          <Input 
                            placeholder=".content, #main, article"
                            value={extractionConfig.cssSelector}
                            onChange={(e) => setExtractionConfig(prev => ({...prev, cssSelector: e.target.value}))}
                          />
                        </div>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Results Section */}
            {results && (
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span>Crawl Results</span>
                    </CardTitle>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => downloadResults('markdown')}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Markdown
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => downloadResults('json')}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        JSON
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="markdown">
                    <TabsList>
                      <TabsTrigger value="markdown" className="flex items-center space-x-2">
                        <FileText className="h-4 w-4" />
                        <span>Markdown</span>
                      </TabsTrigger>
                      <TabsTrigger value="data" className="flex items-center space-x-2">
                        <Code className="h-4 w-4" />
                        <span>Extracted Data</span>
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="markdown" className="mt-4">
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 max-h-96 overflow-y-auto">
                        <pre className="text-sm whitespace-pre-wrap">{results.markdown}</pre>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="data" className="mt-4">
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 max-h-96 overflow-y-auto">
                        <pre className="text-sm">{JSON.stringify(results.extractedData, null, 2)}</pre>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            {results && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Crawl Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Crawl Time:</span>
                    <span className="text-sm font-medium">{results.metadata.crawlTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Word Count:</span>
                    <span className="text-sm font-medium">{results.metadata.wordCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Links Found:</span>
                    <span className="text-sm font-medium">{results.metadata.linkCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Images Found:</span>
                    <span className="text-sm font-medium">{results.metadata.imageCount}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Features */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Brain className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium">AI-Powered Extraction</p>
                    <p className="text-xs text-gray-600">LLM-driven content analysis</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Zap className="h-5 w-5 text-yellow-600" />
                  <div>
                    <p className="text-sm font-medium">Lightning Fast</p>
                    <p className="text-xs text-gray-600">6x faster performance</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Monitor className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium">Browser Control</p>
                    <p className="text-xs text-gray-600">Full session management</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <FileText className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="text-sm font-medium">Clean Markdown</p>
                    <p className="text-xs text-gray-600">Optimized for LLMs</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Start */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Start</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="space-y-2">
                  <p className="font-medium">1. Enter URL</p>
                  <p className="text-gray-600">Paste any website URL you want to crawl</p>
                </div>
                <div className="space-y-2">
                  <p className="font-medium">2. Configure Options</p>
                  <p className="text-gray-600">Choose extraction settings and output format</p>
                </div>
                <div className="space-y-2">
                  <p className="font-medium">3. Start Crawling</p>
                  <p className="text-gray-600">Click crawl and get clean, structured results</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App

