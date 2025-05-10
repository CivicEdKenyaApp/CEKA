
  // Render resource card based on view mode
  const renderResourceCard = (resource: Resource) => {
    const isSelected = selectedResources.includes(resource.id);
    
    if (viewMode === 'grid') {
      return (
        <motion.div
          key={resource.id}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full"
          layout
        >
          <Card className={`h-full transition-shadow hover:shadow-md overflow-hidden ${isSelected ? 'border-primary' : ''}`}>
            <div className="relative">
              <div className="absolute top-2 right-2 z-10">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={`rounded-full ${isSelected ? 'bg-primary text-primary-foreground' : 'bg-background text-foreground opacity-70 hover:opacity-100'}`}
                  onClick={() => toggleResourceSelection(resource.id)}
                >
                  {isSelected ? <CheckCircle2 className="h-5 w-5" /> : <Download className="h-5 w-5" />}
                </Button>
              </div>
              <div className="bg-muted aspect-video relative flex items-center justify-center">
                {resource.thumbnail ? (
                  <img 
                    src={resource.thumbnail} 
                    alt={resource.title} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full w-full">
                    {getTypeIcon(resource.type)}
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-2">
                  <Badge variant="outline" className="bg-background/80">
                    <div className="flex items-center gap-1">
                      {getTypeIcon(resource.type)}
                      {resource.type.toUpperCase()}
                    </div>
                  </Badge>
                </div>
              </div>
            </div>
            <CardHeader className="p-4 pb-2">
              <Link to={`/resources/${resource.id}`}>
                <CardTitle className="text-lg leading-tight hover:underline line-clamp-2">{resource.title}</CardTitle>
              </Link>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <p className="text-muted-foreground text-sm line-clamp-2">{resource.description}</p>
            </CardContent>
            <CardFooter className="px-4 py-3 border-t flex justify-between">
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">{new Date(resource.dateAdded).toLocaleDateString()}</span>
                <span className="text-xs text-muted-foreground">{resource.views} views</span>
              </div>
              <Button size="sm" variant="secondary" asChild>
                <Link to={`/resources/${resource.id}`}>
                  {translate("View Details", language)}
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      );
    } else {
      // List view
      return (
        <motion.div
          key={resource.id}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          layout
        >
          <Card className={`transition-shadow hover:shadow-md ${isSelected ? 'border-primary' : ''}`}>
            <div className="flex items-start p-4">
              <div className="hidden sm:block mr-4 bg-muted h-24 w-24 flex-shrink-0 flex items-center justify-center rounded-md">
                {resource.thumbnail ? (
                  <img 
                    src={resource.thumbnail} 
                    alt={resource.title} 
                    className="w-full h-full object-cover rounded-md"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full w-full">
                    {getTypeIcon(resource.type)}
                  </div>
                )}
              </div>
              <div className="flex-grow min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="bg-background/80">
                    <div className="flex items-center gap-1">
                      {getTypeIcon(resource.type)}
                      {resource.type.toUpperCase()}
                    </div>
                  </Badge>
                  <Badge variant="secondary">{resource.category}</Badge>
                </div>
                <Link to={`/resources/${resource.id}`}>
                  <h3 className="font-semibold hover:underline line-clamp-1">{resource.title}</h3>
                </Link>
                <p className="text-muted-foreground text-sm line-clamp-1">{resource.description}</p>
                <div className="flex justify-between items-center mt-2">
                  <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground">{new Date(resource.dateAdded).toLocaleDateString()}</span>
                    <span className="text-xs text-muted-foreground">{resource.views} views</span>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => toggleResourceSelection(resource.id)}>
                      {isSelected ? <CheckCircle2 className="h-4 w-4 mr-1" /> : <Download className="h-4 w-4 mr-1" />}
                      {isSelected ? "Selected" : "Select"}
                    </Button>
                    <Button size="sm" variant="secondary" asChild>
                      <Link to={`/resources/${resource.id}`}>
                        {translate("View Details", language)}
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      );
    }
  };
